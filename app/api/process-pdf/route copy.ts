import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { merchantModel } from "@/lib/models/merchant"
import { anzsicModel } from "@/lib/models/anzsic-mapping"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type?: "debit" | "credit"
  balance?: number
  category?: string
}

interface ProcessedTransaction extends Transaction {
  merchantName: string
  anzsicCode: string
  anzsicDescription: string
  atoCategory: string
  isDeductible: boolean
  confidence: number
}

// Pre-compiled regex patterns for maximum performance
const COMPILED_PATTERNS = {
  amex: {
    datePattern:
      /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})$/,
    amountPattern: /^(-?\d+\.\d{2})$/,
  },
  anz: new RegExp(
    [
      "(",
      "(\\d{2}/\\d{2}/\\d{4})\\s+", // date_processed
      "(\\d{2}/\\d{2}/\\d{4})\\s+", // date_transaction
      "(\\d{4})\\s+", // card
      "(.*?)\\s+", // description
      "\\$?([\\d,]+\\.\\d{2})\\s*", // amount
      "(CR)?\\s+", // credit_label
      "\\$?([\\d,]+\\.\\d{2})", // balance
      ")",
    ].join(""),
    "g",
  ),
  westpac: {
    datePattern: /^(\d{2}\/\d{2}\/\d{2,4})/,
    amountPattern: /[\d,]+\.\d{2}/g,
  },
  cba: {
    datePattern: /^(\d{1,2})\s+([A-Za-z]+)\s*(\d{4})?/,
    balancePattern: /(OPENING BALANCE|CLOSING BALANCE)/,
  },
}

// Pre-built month mapping for fast lookups
const MONTH_MAP: Record<string, string> = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const bank = formData.get("bank") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!bank) {
      return NextResponse.json({ error: "No bank specified" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Optimized PDF processing
    const dataBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(dataBuffer)

    const pdfParse = (await import("pdf-parse")).default
    const pdfData = await pdfParse(buffer, {
      max: 0, // No page limit
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    })

    const fullText = pdfData.text

    // Fast bank routing with optimized parsers
    let transactions: Transaction[] = []
    let accountInfo = {}

    const bankLower = bank.toLowerCase()
    switch (bankLower) {
      case "amex":
        ;({ transactions, accountInfo } = parseAmexOptimized(fullText))
        break
      case "anz":
        ;({ transactions, accountInfo } = parseAnzOptimized(fullText))
        break
      case "cba":
        ;({ transactions, accountInfo } = parseCbaOptimized(fullText))
        break
      case "westpac":
        ;({ transactions, accountInfo } = parseWestpacOptimized(fullText))
        break
      default:
        return NextResponse.json({ error: `No parser available for bank: ${bank}` }, { status: 400 })
    }

    // 🚀 Process transactions with enhanced merchant/ANZSIC mapping
    console.log(`🚀 Processing ${transactions.length} transactions with enhanced LEFT JOIN mapping...`)
    const startTime = Date.now()

    const processedTransactions: ProcessedTransaction[] = transactions.map((transaction, index) => {
      console.log(`\n--- Processing Transaction ${index + 1}/${transactions.length} ---`)

      // Step 1: Extract merchant and get ANZSIC code from merchant table
      const merchantResult = merchantModel.extractFromDescription(transaction.description || "Unknown")
      console.log(`Merchant result:`, merchantResult)

      // Step 2: LEFT JOIN with ANZSIC table to get category info
      const anzsicMapping = anzsicModel.findByCode(merchantResult.anzsicCode)
      console.log(`ANZSIC mapping:`, anzsicMapping)

      const processed: ProcessedTransaction = {
        ...transaction,
        merchantName: merchantResult.merchantName,
        anzsicCode: merchantResult.anzsicCode,
        anzsicDescription: anzsicMapping?.anzsicDescription || "Unknown",
        atoCategory: anzsicMapping?.atoCategory || "Other",
        isDeductible: anzsicMapping?.isDeductible || false,
        confidence: merchantResult.confidence,
      }

      console.log(`Final result - Deductible: ${processed.isDeductible}, Category: ${processed.atoCategory}`)
      return processed
    })

    const processingTime = Date.now() - startTime
    const deductibleTransactions = processedTransactions.filter((t) => t.isDeductible)
    const totalDeductibleAmount = deductibleTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    console.log(`\n✅ Processing Summary:`)
    console.log(`- Total transactions: ${transactions.length}`)
    console.log(`- Deductible transactions: ${deductibleTransactions.length}`)
    console.log(`- Total deductible amount: $${totalDeductibleAmount.toFixed(2)}`)
    console.log(`- Processing time: ${processingTime}ms`)

    return NextResponse.json(
      {
        success: true,
        bank: bank.toUpperCase(),
        pageCount: pdfData.numpages,
        transactionCount: transactions.length,
        accountInfo,
        transactions: processedTransactions, // Return processed transactions with merchant/ANZSIC data
        summary: {
          totalTransactions: transactions.length,
          deductibleTransactions: deductibleTransactions.length,
          totalDeductibleAmount: Math.round(totalDeductibleAmount * 100) / 100,
          processingTimeMs: processingTime,
          unknownMerchants: processedTransactions.filter((t) => t.anzsicCode === "9999").length,
        },
        rawTextPreview: fullText.substring(0, 1000) + (fullText.length > 1000 ? "..." : ""),
        metadata: {
          processingDate: new Date().toISOString(),
          fileName: file.name,
          textLength: fullText.length,
          fileSize: file.size,
        },
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message,
        stack: process.env.NODE_ENV === "development" ? (err as Error).stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const merchantStats = await merchantModel.getStats()
  const anzsicStats = await anzsicModel.getStats()

  return NextResponse.json(
    {
      message: "PDF Parser API is working with enhanced merchant/ANZSIC mapping",
      timestamp: new Date().toISOString(),
      methods: ["GET", "POST"],
      status: "ready",
      supportedBanks: ["amex", "anz", "cba", "westpac"],
      dataStats: {
        merchants: merchantStats.totalMerchants,
        anzsicMappings: anzsicStats.totalMappings,
        dataSource: "flat-files-with-enhanced-left-join",
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
    { status: 200 },
  )
}

// Optimized AMEX parser
function parseAmexOptimized(text: string): { transactions: Transaction[]; accountInfo: any } {
  const transactions: Transaction[] = []
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const { datePattern, amountPattern } = COMPILED_PATTERNS.amex

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const dateMatch = datePattern.exec(line)

    if (dateMatch) {
      const monthName = dateMatch[1]
      const day = dateMatch[2].padStart(2, "0")
      const dateStr = `2025-${MONTH_MAP[monthName]}-${day}`

      i++
      if (i >= lines.length) break

      const description = lines[i]
      let amount = 0

      // Fast lookahead for amount (max 3 lines)
      const maxLookahead = Math.min(3, lines.length - i - 1)
      for (let j = 1; j <= maxLookahead; j++) {
        const amountMatch = amountPattern.exec(lines[i + j])
        if (amountMatch) {
          amount = Math.abs(Number.parseFloat(amountMatch[1]))
          i += j
          break
        }
      }

      if (amount > 0) {
        transactions.push({
          id: uuidv4(),
          date: dateStr,
          description,
          amount,
          type: "debit",
        })
      }
    }
    i++
  }

  return { transactions, accountInfo: {} }
}

// Optimized ANZ parser
function parseAnzOptimized(text: string): { transactions: Transaction[]; accountInfo: any } {
  const transactions: Transaction[] = []
  const pattern = COMPILED_PATTERNS.anz

  let match
  while ((match = pattern.exec(text)) !== null) {
    const rawDate = match[2] // date_transaction
    const [day, month, year] = rawDate.split("/")
    const dateIso = `${year}-${month}-${day}`

    const amountStr = match[6].replace(/,/g, "")
    const amount = Number.parseFloat(amountStr)
    const creditLabel = match[7]
    const description = match[5].trim()

    const signedAmount = creditLabel ? -amount : amount

    transactions.push({
      id: uuidv4(),
      date: dateIso,
      description,
      amount: signedAmount,
    })
  }

  return { transactions, accountInfo: {} }
}

// Optimized CBA parser
function parseCbaOptimized(text: string): { transactions: Transaction[]; accountInfo: any } {
  const transactions: Transaction[] = []
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const { datePattern, balancePattern } = COMPILED_PATTERNS.cba

  for (const line of lines) {
    if (balancePattern.test(line)) {
      const dateMatch = datePattern.exec(line)
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, "0")
        const monthStr = dateMatch[2]
        const year = dateMatch[3] || "2022"
        const month = MONTH_MAP[monthStr] || "01"
        const date = `${year}-${month}-${day}`

        transactions.push({
          id: uuidv4(),
          date,
          description: line.includes("OPENING") ? "OPENING BALANCE" : "CLOSING BALANCE",
          amount: 0,
        })
      }
    }
  }

  return { transactions, accountInfo: {} }
}

// Optimized Westpac parser
function parseWestpacOptimized(text: string): { transactions: Transaction[]; accountInfo: any } {
  const transactions: Transaction[] = []
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const { datePattern, amountPattern } = COMPILED_PATTERNS.westpac

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const dateMatch = datePattern.exec(line)

    if (dateMatch) {
      const rawDate = dateMatch[1]
      let description = line.substring(rawDate.length).trim()

      // Fast multiline description collection
      let nextIndex = i + 1
      while (nextIndex < lines.length && !datePattern.test(lines[nextIndex])) {
        description += " " + lines[nextIndex]
        nextIndex++
      }
      i = nextIndex - 1

      const amountMatches = description.match(amountPattern)
      if (!amountMatches || amountMatches.length < 2) continue

      const transactionAmount = Number.parseFloat(amountMatches[0].replace(/,/g, ""))
      const descLower = description.toLowerCase()

      const isCredit =
        descLower.includes("deposit") ||
        descLower.includes("salary") ||
        descLower.includes("transfer") ||
        descLower.includes("refund")

      const type: "debit" | "credit" = isCredit ? "credit" : "debit"
      const signedAmount = type === "debit" ? -Math.abs(transactionAmount) : Math.abs(transactionAmount)

      transactions.push({
        id: uuidv4(),
        date: normalizeDateFast(rawDate),
        description: cleanDescriptionFast(description),
        amount: signedAmount,
        type,
      })
    }
  }

  return { transactions, accountInfo: {} }
}

// Optimized utility functions
function normalizeDateFast(dateStr: string): string {
  const parts = dateStr.split("/")
  let year = parts[2]
  if (year.length === 2) {
    year = "20" + year
  }
  return `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
}

function cleanDescriptionFast(text: string): string {
  return text
    .replace(/[\d,]+\.\d{2}/g, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}
