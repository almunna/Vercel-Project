"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TestPdfPage() {
  const [getResult, setGetResult] = useState<any>(null)
  const [postResults, setPostResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testGet = async () => {
    setLoading({ ...loading, get: true })
    try {
      const response = await fetch("/api/parse-pdf")
      const data = await response.json()
      setGetResult(data)
    } catch (error) {
      setGetResult({ error: (error as Error).message })
    }
    setLoading({ ...loading, get: false })
  }

  const testBank = async (bank: string) => {
    setLoading({ ...loading, [bank]: true })
    try {
      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bank }),
      })
      const data = await response.json()
      setPostResults({ ...postResults, [bank]: data })
    } catch (error) {
      setPostResults({ ...postResults, [bank]: { error: (error as Error).message } })
    }
    setLoading({ ...loading, [bank]: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">PDF Parser API Test</h1>
          <p className="text-zinc-400">Test the PDF parsing functionality</p>
        </div>

        {/* GET Test */}
        <Card className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">API Status Check</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testGet} disabled={loading.get} className="bg-blue-600 hover:bg-blue-700 mb-4">
              {loading.get ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test GET
            </Button>

            {getResult && (
              <div className="mt-4">
                <pre className="bg-zinc-800 p-4 rounded text-green-400 text-sm overflow-auto max-h-96">
                  {JSON.stringify(getResult, null, 2)}
                </pre>
                {getResult.fileStatus && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(getResult.fileStatus).map(([bank, exists]) => (
                      <Badge key={bank} variant={exists ? "default" : "destructive"} className="justify-center">
                        {bank.toUpperCase()}: {exists ? "✅" : "❌"}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["amex", "anz", "cba", "westpac"].map((bank) => (
            <Card key={bank} className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-center">{bank.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => testBank(bank)}
                  disabled={loading[bank]}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 mb-4"
                >
                  {loading[bank] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Test {bank.toUpperCase()}
                </Button>

                {postResults[bank] && (
                  <div className="space-y-2">
                    {postResults[bank].success ? (
                      <Alert className="border-green-800 bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-300">
                          <div className="space-y-1">
                            <div>✅ Success!</div>
                            <div>📄 {postResults[bank].pageCount} pages</div>
                            <div>💰 {postResults[bank].transactionCount} transactions</div>
                            <div>📝 {postResults[bank].metadata?.textLength} chars</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-red-800 bg-red-900/20">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-300">❌ {postResults[bank].error}</AlertDescription>
                      </Alert>
                    )}

                    {postResults[bank].transactions && postResults[bank].transactions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-white font-semibold mb-2">Sample Transactions:</h4>
                        <div className="space-y-1 max-h-32 overflow-auto">
                          {postResults[bank].transactions.slice(0, 3).map((tx: any, i: number) => (
                            <div key={i} className="text-xs text-zinc-300 bg-zinc-800 p-2 rounded">
                              <div>{tx.date}</div>
                              <div className="truncate">{tx.description}</div>
                              <div className="font-mono">${tx.amount}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
