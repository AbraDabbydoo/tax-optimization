"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function DebugCsvStructure() {
  const [csvPreview, setCsvPreview] = useState("")
  const [csvStructure, setCsvStructure] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAndAnalyzeCsv = async () => {
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

      // Analyze the CSV structure
      const lines = csvData.split("\n").filter((line) => line.trim() !== "")
      const headers = lines[0].split(",").map((h) => h.trim())

      // Get a sample of records
      const sampleRecords = []
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const record: Record<string, string> = {}

        headers.forEach((header, index) => {
          if (index < values.length) {
            record[header] = values[index]
          } else {
            record[header] = ""
          }
        })

        sampleRecords.push(record)
      }

      // Analyze column names and values
      const columnAnalysis = headers.map((header) => {
        const values = sampleRecords.map((record) => record[header]).filter(Boolean)
        const uniqueValues = [...new Set(values)]

        return {
          name: header,
          examples: uniqueValues.slice(0, 3),
          empty: sampleRecords.filter((record) => !record[header]).length,
          total: sampleRecords.length,
        }
      })

      setCsvStructure({
        headers,
        recordCount: lines.length - 1,
        sampleRecords,
        columnAnalysis,
      })
    } catch (err) {
      console.error("Error fetching or analyzing CSV:", err)
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug CSV Structure</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>CSV Structure Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAndAnalyzeCsv} disabled={loading}>
            {loading ? "Loading..." : "Fetch and Analyze CSV"}
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

      {csvStructure && (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>CSV Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <strong>Headers:</strong> {csvStructure.headers.join(", ")}
              </div>
              <div className="mb-4">
                <strong>Record Count:</strong> {csvStructure.recordCount}
              </div>

              <h3 className="text-lg font-semibold mb-2">Column Analysis:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {csvStructure.columnAnalysis.map((column: any, index: number) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-bold">{column.name}</div>
                    <div className="text-sm">
                      Examples: {column.examples.length > 0 ? column.examples.join(", ") : "None"}
                    </div>
                    <div className="text-sm">
                      Empty: {column.empty}/{column.total}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Records</CardTitle>
            </CardHeader>
            <CardContent>
              {csvStructure.sampleRecords.map((record: any, index: number) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-bold">Record {index + 1}</h4>
                  <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-2 rounded">
                    {JSON.stringify(record, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
