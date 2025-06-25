"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function DebugCsvImport() {
  const [csvPreview, setCsvPreview] = useState("")
  const [parsedData, setParsedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAndParseCsv = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch the CSV data
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/income%20tax%20csv-RWV0QAYMyHTzlNwkmXyeywSml16Ygt.csv",
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
      }

      const csvData = await response.text()
      setCsvPreview(csvData.substring(0, 1000) + "...")

      // Parse the CSV data manually
      const lines = csvData.split("\n").filter((line) => line.trim() !== "")
      const headers = lines[0].split(",").map((h) => h.trim())

      const records = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        if (values.length !== headers.length) {
          console.warn(`Line ${i + 1} has ${values.length} values but headers has ${headers.length}`)
          continue
        }

        const record: Record<string, string> = {}
        headers.forEach((header, index) => {
          record[header] = values[index]
        })
        records.push(record)
      }

      // Process the records into state tax data
      const stateData: Record<string, any> = {}

      records.forEach((record) => {
        const stateCode = record.stateCode
        if (!stateCode) return

        // Initialize state if not exists
        if (!stateData[stateCode]) {
          stateData[stateCode] = {
            incomeTax: {
              hasIncomeTax: true,
              brackets: {
                single: [],
                married: [],
                headOfHousehold: [],
              },
            },
          }
        }

        // Determine filing status
        let filingStatusKey = "single"
        const filingStatus = record.filingStatus?.toLowerCase()

        if (filingStatus === "single") {
          filingStatusKey = "single"
        } else if (
          filingStatus === "married" ||
          filingStatus === "married filing jointly" ||
          filingStatus === "marriedjoint"
        ) {
          filingStatusKey = "married"
        } else if (
          filingStatus === "head of household" ||
          filingStatus === "headofhousehold" ||
          filingStatus === "hoh"
        ) {
          filingStatusKey = "headOfHousehold"
        } else {
          console.warn(`Unknown filing status: ${filingStatus}`)
          return
        }

        // Add bracket
        const min = Number.parseFloat(record.minIncome || "0")
        const max = record.maxIncome && record.maxIncome !== "null" ? Number.parseFloat(record.maxIncome) : null
        const rate = Number.parseFloat(record.rate || "0")

        stateData[stateCode].incomeTax.brackets[filingStatusKey].push({
          min,
          max,
          rate,
        })
      })

      // Sort brackets
      Object.keys(stateData).forEach((stateCode) => {
        const brackets = stateData[stateCode].incomeTax.brackets

        Object.keys(brackets).forEach((status) => {
          brackets[status].sort((a: any, b: any) => a.min - b.min)
        })
      })

      setParsedData(stateData)
    } catch (err) {
      console.error("Error fetching or parsing CSV:", err)
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug CSV Import</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>CSV Import Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAndParseCsv} disabled={loading}>
            {loading ? "Loading..." : "Fetch and Parse CSV"}
          </Button>

          {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        </CardContent>
      </Card>

      {csvPreview && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>CSV Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={csvPreview} readOnly className="h-40 font-mono text-sm" />
          </CardContent>
        </Card>
      )}

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>States found:</strong> {Object.keys(parsedData).length}
            </div>
            <div className="mb-4">
              <strong>State codes:</strong> {Object.keys(parsedData).join(", ")}
            </div>

            <h3 className="text-lg font-semibold mb-2">Sample State Data:</h3>
            {Object.keys(parsedData)
              .slice(0, 3)
              .map((stateCode) => (
                <div key={stateCode} className="mb-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-bold">{stateCode}</h4>
                  <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-2 rounded">
                    {JSON.stringify(parsedData[stateCode], null, 2)}
                  </pre>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
