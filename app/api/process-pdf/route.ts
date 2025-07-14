import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { merchantModel } from "@/lib/models/merchant";
import { anzsicModel } from "@/lib/models/anzsic-mapping";

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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!bank) {
      return NextResponse.json({ error: "No bank specified" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    const dataBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(dataBuffer);

    let transactions: Transaction[] = [];

    const bankLower = bank.toLowerCase();

    if (["westpac", "amex", "anz", "cba"].includes(bankLower)) {
      const { randomUUID } = await import("crypto");
      const { spawn } = await import("child_process");
      const { promises: fs } = await import("fs");
      const path = await import("path");

      const tmpFile = path.join("/tmp", `${randomUUID()}.pdf`);
      await fs.writeFile(tmpFile, buffer);

      let scriptPath = `./app/api/parsers/parse_pdf_${bankLower}.py`;
      let stdout = "";
      let stderr = "";

      const runPython = async (script: string) => {
        const process = spawn("./.venv/bin/python", [script, tmpFile]);

        stdout = "";
        stderr = "";

        process.stdout.on("data", (data) => {
          stdout += data.toString();
        });
        process.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        const exitCode = await new Promise<number>((resolve) => {
          process.on("close", resolve);
        });

        return { exitCode, stdout, stderr };
      };

      // Run primary script
      let { exitCode } = await runPython(scriptPath);

      // For westpac, fallback if no transactions
      if (bankLower === "westpac") {
        const parsed = JSON.parse(stdout || "[]");
        if (parsed.length === 0) {
          console.log("Primary Westpac script returned no transactions, trying fallback...");
          scriptPath = "./app/api/parsers/parse_pdf_westpac_credit_card.py";
          ({ exitCode } = await runPython(scriptPath));
        }
      }

      await fs.unlink(tmpFile);

      if (exitCode !== 0) {
        console.error(`Python error for ${bank}:`, stderr);
        return NextResponse.json({ success: false, error: stderr || "Python process failed" }, { status: 500 });
      }

      transactions = JSON.parse(stdout);
    } else {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer, {
        max: 0,
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      });

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
          return NextResponse.json({ error: `No parser available for bank: ${bank}` }, { status: 400 });
      }
    }

    console.log(`🚀 Processing ${transactions.length} transactions...`);
    const startTime = Date.now();

    // Filter out any transactions with "balance"
    const processedTransactions: ProcessedTransaction[] = transactions
      .filter((t) => !(t.description || "").toLowerCase().includes("balance"))
      .map((transaction) => {
        const merchantResult = merchantModel.extractFromDescription(transaction.description || "Unknown");
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
    const deductibleTransactions = processedTransactions.filter((t) => t.isDeductible);
    const totalDeductibleAmount = deductibleTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

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
          unknownMerchants: processedTransactions.filter((t) => t.anzsicCode === "9999").length,
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
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message,
        stack: process.env.NODE_ENV === "development" ? (err as Error).stack : undefined,
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

// Keep your parseXOptimized functions unchanged if you still use them elsewhere
