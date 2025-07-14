import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { merchantModel } from "@/lib/models/merchant";
import { anzsicModel } from "@/lib/models/anzsic-mapping";

import path from "path";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type?: "debit" | "credit";
  balance?: number;
  category?: string;
}

interface ProcessedTransaction extends Transaction {
  merchantName: string;
  anzsicCode: string;
  anzsicDescription: string;
  atoCategory: string;
  isDeductible: boolean;
  confidence: number;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bank = formData.get("bank") as string;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!bank)
      return NextResponse.json({ error: "No bank specified" }, { status: 400 });
    if (file.type !== "application/pdf")
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );

    const dataBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(dataBuffer);
    const bankLower = bank.toLowerCase();
    let transactions: Transaction[] = [];

    if (["westpac", "amex", "anz", "cba"].includes(bankLower)) {
      const tmpDir = path.join(process.cwd(), "tmp");
      await fs.mkdir(tmpDir, { recursive: true });

      const tmpFile = path.join(tmpDir, `${uuidv4()}.pdf`);
      await fs.writeFile(tmpFile, buffer);

      const scriptPath = path.join(
        process.cwd(),
        "app",
        "api",
        "parsers",
        `parse_pdf_${bankLower}.py`
      );

      const runPython = async (
        script: string
      ): Promise<{
        exitCode: number;
        stdout: string;
        stderr: string;
      }> => {
        return new Promise((resolve) => {
          const pythonExecutable = "python"; // 🔧 Use general system python
          const child = spawn(pythonExecutable, [script, tmpFile], {
            shell: false,
            windowsHide: true,
          });

          let stdout = "";
          let stderr = "";

          child.stdout.on("data", (data) => (stdout += data.toString()));
          child.stderr.on("data", (data) => (stderr += data.toString()));

          child.on("close", (code) => {
            resolve({ exitCode: code ?? 1, stdout, stderr });
          });
        });
      };

      let { exitCode, stdout, stderr } = await runPython(scriptPath);

      // Fallback if Westpac script returned no transactions
      if (bankLower === "westpac") {
        const parsed = JSON.parse(stdout || "[]");
        if (parsed.length === 0) {
          console.log(
            "Primary Westpac script returned no data. Trying fallback..."
          );
          const fallbackScript = path.join(
            process.cwd(),
            "app",
            "api",
            "parsers",
            "parse_pdf_westpac_credit_card.py"
          );
          ({ exitCode, stdout, stderr } = await runPython(fallbackScript));
        }
      }

      await fs.unlink(tmpFile); // clean up

      if (exitCode !== 0) {
        console.error(`Python error for ${bank}:`, stderr);
        return NextResponse.json(
          { success: false, error: stderr },
          { status: 500 }
        );
      }

      transactions = JSON.parse(stdout || "[]");
    } else {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      const fullText = pdfData.text;

      switch (bankLower) {
        case "amex":
          ({ transactions } = parseAmexOptimized(fullText));
          break;
        case "anz":
          ({ transactions } = parseAnzOptimized(fullText));
          break;
        case "cba":
          ({ transactions } = parseCbaOptimized(fullText));
          break;
        default:
          return NextResponse.json(
            { error: `No parser available for bank: ${bank}` },
            { status: 400 }
          );
      }
    }

    // Post-processing
    const startTime = Date.now();
    const processedTransactions: ProcessedTransaction[] = transactions
      .filter((t) => !(t.description || "").toLowerCase().includes("balance"))
      .map((transaction) => {
        const merchantResult = merchantModel.extractFromDescription(
          transaction.description || "Unknown"
        );
        const anzsicMapping = anzsicModel.findByCode(merchantResult.anzsicCode);

        return {
          ...transaction,
          merchantName: merchantResult.merchantName,
          anzsicCode: merchantResult.anzsicCode,
          anzsicDescription: anzsicMapping?.anzsicDescription || "Unknown",
          atoCategory: anzsicMapping?.atoCategory || "Other",
          isDeductible: anzsicMapping?.isDeductible || false,
          confidence: merchantResult.confidence,
        };
      });

    const processingTime = Date.now() - startTime;
    const deductibleTransactions = processedTransactions.filter(
      (t) => t.isDeductible
    );
    const totalDeductibleAmount = deductibleTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    return NextResponse.json(
      {
        success: true,
        bank: bank.toUpperCase(),
        transactionCount: transactions.length,
        transactions: processedTransactions,
        summary: {
          totalTransactions: transactions.length,
          deductibleTransactions: deductibleTransactions.length,
          totalDeductibleAmount: Math.round(totalDeductibleAmount * 100) / 100,
          processingTimeMs: processingTime,
          unknownMerchants: processedTransactions.filter(
            (t) => t.anzsicCode === "9999"
          ).length,
        },
        metadata: {
          processingDate: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message,
        stack:
          process.env.NODE_ENV === "development"
            ? (err as Error).stack
            : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const merchantStats = await merchantModel.getStats();
  const anzsicStats = await anzsicModel.getStats();

  return NextResponse.json(
    {
      message: "PDF Parser API is working",
      timestamp: new Date().toISOString(),
      methods: ["GET", "POST"],
      status: "ready",
      supportedBanks: ["amex", "anz", "cba", "westpac"],
      dataStats: {
        merchants: merchantStats.totalMerchants,
        anzsicMappings: anzsicStats.totalMappings,
        dataSource: "flat-files",
      },
      usage: {
        endpoint: "/api/process-pdf",
        method: "POST",
        contentType: "multipart/form-data",
        fields: {
          file: "PDF file",
          bank: "amex|anz|cba|westpac",
        },
      },
    },
    { status: 200 }
  );
}
