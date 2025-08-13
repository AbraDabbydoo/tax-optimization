"use client"

import { useEffect, useState } from "react"
import { stateTaxDataPromise } from "@/lib/state-tax-data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [taxData, setTaxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string>("NC")

  useEffect(() => {
    async function loadData() {
      try {
        const data = await stateTaxDataPromise
        setTaxData(data)
        setLoading(false)
      } catch (err) {
        console.error("Error loading tax data:", err)
        setError("Failed to load tax data")
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4">Loading tax data...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  const stateData = taxData?.[selectedState]

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tax Calculator Debug Tools</h1>
        <p className="text-muted-foreground">
          Debug and test the tax calculation system
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Single State Calculator</CardTitle>
            <CardDescription>
              Test tax calculations for individual states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Calculate taxes for a specific state with detailed breakdowns.
            </p>
            <Button asChild>
              <Link href="/debug/tax-calculation">Open Calculator</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch State Testing</CardTitle>
            <CardDescription>
              Test tax calculations across all 51 states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Run comprehensive tests with configurable parameters across all states.
            </p>
            <Button asChild>
              <Link href="/debug/batch-test">Run Batch Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Original State Data Debugger */}
      <Card>
        <CardHeader>
          <CardTitle>State Data Inspector</CardTitle>
          <CardDescription>View detailed tax data for individual states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block mb-2">Select State:</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="border p-2 rounded w-full">
              {taxData &&
                Object.keys(taxData).map((stateCode) => (
                  <option key={stateCode} value={stateCode}>
                    {stateCode} - {taxData[stateCode].name}
                  </option>
                ))}
            </select>
          </div>

          {stateData ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">
                  {stateData.name} ({selectedState})
                </h2>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Income Tax</h3>
                <div className="pl-4">
                  <p>Has Income Tax: {stateData.incomeTax?.hasIncomeTax ? "Yes" : "No"}</p>

                  {stateData.incomeTax?.hasIncomeTax && (
                    <div className="mt-2">
                      <h4 className="font-medium">Tax Brackets:</h4>
                      <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(stateData.incomeTax.brackets, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Raw Data</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(stateData, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div>No data available for {selectedState}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
