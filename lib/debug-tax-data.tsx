"use client"

import { useEffect, useState } from "react"
import { stateTaxDataPromise } from "./state-tax-data"

export default function DebugTaxData() {
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
    return <div>Loading tax data...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  const stateData = taxData?.[selectedState]

  return (
    <div className="p-4">
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
                  {stateData.incomeTax?.brackets &&
                  typeof stateData.incomeTax.brackets === "object" &&
                  !Array.isArray(stateData.incomeTax.brackets) ? (
                    <div>
                      <h5 className="font-medium mt-2">Single:</h5>
                      <ul className="list-disc pl-8">
                        {stateData.incomeTax.brackets.single?.map((bracket: any, index: number) => (
                          <li key={index}>
                            Min: ${bracket.min.toLocaleString()}, Max:{" "}
                            {bracket.max === null ? "No limit" : `$${bracket.max.toLocaleString()}`}, Rate:{" "}
                            {bracket.rate}%
                          </li>
                        ))}
                      </ul>

                      <h5 className="font-medium mt-2">Married:</h5>
                      <ul className="list-disc pl-8">
                        {stateData.incomeTax.brackets.married?.map((bracket: any, index: number) => (
                          <li key={index}>
                            Min: ${bracket.min.toLocaleString()}, Max:{" "}
                            {bracket.max === null ? "No limit" : `$${bracket.max.toLocaleString()}`}, Rate:{" "}
                            {bracket.rate}%
                          </li>
                        ))}
                      </ul>

                      <h5 className="font-medium mt-2">Head of Household:</h5>
                      <ul className="list-disc pl-8">
                        {stateData.incomeTax.brackets.headOfHousehold?.map((bracket: any, index: number) => (
                          <li key={index}>
                            Min: ${bracket.min.toLocaleString()}, Max:{" "}
                            {bracket.max === null ? "No limit" : `$${bracket.max.toLocaleString()}`}, Rate:{" "}
                            {bracket.rate}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : Array.isArray(stateData.incomeTax?.brackets) ? (
                    <ul className="list-disc pl-8">
                      {stateData.incomeTax.brackets.map((bracket: any, index: number) => (
                        <li key={index}>
                          Min: ${bracket.min.toLocaleString()}, Max:{" "}
                          {bracket.max === null ? "No limit" : `$${bracket.max.toLocaleString()}`}, Rate: {bracket.rate}
                          %
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-500">No bracket data available or in unexpected format</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Sales Tax</h3>
            <div className="pl-4">
              <p>State Rate: {stateData.salesTax?.stateRate}%</p>
              <p>Average Local Rate: {stateData.salesTax?.averageLocalRate}%</p>
              <p>Combined Rate: {stateData.salesTax?.combinedRate}%</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Property Tax</h3>
            <div className="pl-4">
              <p>Average Effective Rate: {stateData.propertyTax?.averageEffectiveRate}%</p>
              <p>Median Annual Tax: ${stateData.propertyTax?.medianAnnualTax?.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Retirement Income</h3>
            <div className="pl-4">
              <p>Social Security Taxed: {stateData.retirementIncome?.socialSecurityTaxed ? "Yes" : "No"}</p>
              <p>Pensions Taxed: {stateData.retirementIncome?.pensionsTaxed ? "Yes" : "No"}</p>
              <p>IRA Distributions Taxed: {stateData.retirementIncome?.iraDistributionsTaxed ? "Yes" : "No"}</p>
              <p>
                Retirement Income Exemption: ${stateData.retirementIncome?.retirementIncomeExemption?.toLocaleString()}
              </p>
              <p>Age Requirement: {stateData.retirementIncome?.retirementIncomeExemptionAgeRequirement}</p>
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
