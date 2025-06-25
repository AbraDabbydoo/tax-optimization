// scripts/csv-to-json-converter.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CsvToJsonConverter() {
  const [csvInput, setCsvInput] = useState("")
  const [jsonOutput, setJsonOutput] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [csvUrl, setCsvUrl] = useState("")

  const convertCsvToJson = () => {
    try {
      setError("")
      
      // Split the CSV into lines
      const lines = csvInput.split("\n").filter(line => line.trim() !== "")
      
      if (lines.length === 0) {
        setError("CSV input is empty")
        return
      }
      
      // Get headers from the first line
      const headers = lines[0].split(",").map(header => header.trim())
      
      // Process data rows
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(",").map(value => value.trim())
        // Fix: Add proper type annotation for the row object
        const row: { [key: string]: string } = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        
        return row
      })
      
      // Convert to formatted JSON
      setJsonOutput(JSON.stringify(jsonData, null, 2))
    } catch (err: any) { // Add type annotation for the error
      setError(`Error converting CSV: ${err.message}`)
    }
  }

  const fetchAndParseCsv = async () => {
    if (!csvUrl) {
      setError("Please enter a URL to fetch CSV data")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      // Add a console log to debug
      console.log("Fetching CSV from:", csvUrl)
      
      const response = await fetch(csvUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const csvText = await response.text()
      console.log("CSV fetched successfully, length:", csvText.length)
      
      // Set the CSV input and then convert it
      setCsvInput(csvText)
      
      // Split the CSV into lines
      const lines = csvText.split("\n").filter(line => line.trim() !== "")
      
      if (lines.length === 0) {
        setError("Fetched CSV is empty")
        setLoading(false)
        return
      }
      
      // Get headers from the first line
      const headers = lines[0].split(",").map(header => header.trim())
      
      // Process data rows
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(",").map(value => value.trim())
        const row: { [key: string]: string } = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        
        return row
      })
      
      // Convert to formatted JSON
      setJsonOutput(JSON.stringify(jsonData, null, 2))
    } catch (err: any) {
      console.error("Error fetching CSV:", err)
      setError(`Error fetching CSV: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>CSV to JSON Converter</CardTitle>
          <CardDescription>Paste your CSV data or fetch from a URL to convert it to JSON format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New section for fetching CSV from URL */}
          <div className="space-y-2">
            <label className="block mb-2 text-sm font-medium">Fetch CSV from URL</label>
            <div className="flex space-x-2">
              <Input
                placeholder="https://example.com/data.csv"
                value={csvUrl}
                onChange={(e) => setCsvUrl(e.target.value)}
              />
              <Button onClick={fetchAndParseCsv} disabled={loading}>
                {loading ? "Fetching..." : "Fetch & Convert"}
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">CSV Input</label>
            <Textarea 
              placeholder="Paste your CSV here (comma-separated values)" 
              rows={10}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800">
              {error}
            </div>
          )}
          
          <div>
            <label className="block mb-2 text-sm font-medium">JSON Output</label>
            <Textarea 
              placeholder="JSON will appear here" 
              rows={10}
              value={jsonOutput}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            setCsvInput("")
            setJsonOutput("")
            setError("")
            setCsvUrl("")
          }}>
            Clear All
          </Button>
          <Button onClick={convertCsvToJson}>Convert to JSON</Button>
        </CardFooter>
      </Card>
    </div>
  )
}