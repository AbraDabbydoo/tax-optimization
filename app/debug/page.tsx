"use client"

import { useEffect, useState } from "react"
import { stateTaxDataPromise } from "@/lib/state-tax-data"

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tax Data Debugger</h1>

      <div className="mb-4">
        <label className="block mb-2">Select State:</label>
        <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="border p-2 rounded">
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
    </div>
  )
}
