"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TaxCalculationDebugger() {
  const [stateCode, setStateCode] = useState("AL")
  const [income, setIncome] = useState(50000)
  const [filingStatus, setFilingStatus] = useState("single")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateTax = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create a FormData object with the test values
      const formData = new FormData()
      formData.append("residenceState", stateCode)
      formData.append("employmentState", stateCode)
      formData.append("filingStatus", filingStatus)
      formData.append("preferredLifestyle", "indifferent")
      formData.append("regionPreference", "indifferent")
      formData.append("dependents", "0")
      formData.append("annualIncome", income.toString())
      formData.append("retirementIncome", "0")
      formData.append("socialSecurityIncome", "0")
      formData.append("pensionIncome", "0")
      formData.append("iraDistributions", "0")
      formData.append("investmentIncome", "0")
      formData.append("rentalIncome", "0")
      formData.append("royaltyIncome", "0")
      formData.append("trustIncome", "0")
      formData.append("homeValue", "0")
      formData.append("propertyTax", "0")
      formData.append("currentRent", "0")
      formData.append("futurePlans", "")
      formData.append("housingBudget", "0")
      formData.append("hasDependents", "no")
      formData.append("vehicleCount", "0")
      formData.append("vehicleValue", "0")

      // Call the API to calculate tax
      const response = await fetch("/api/debug/calculate-tax", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Error calculating tax:", err)
      setError("Failed to calculate tax. See console for details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tax Calculation Debugger</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={stateCode} onValueChange={setStateCode}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="AK">Alaska</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="AR">Arkansas</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="CT">Connecticut</SelectItem>
                  <SelectItem value="DE">Delaware</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="HI">Hawaii</SelectItem>
                  <SelectItem value="ID">Idaho</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="IN">Indiana</SelectItem>
                  <SelectItem value="IA">Iowa</SelectItem>
                  <SelectItem value="KS">Kansas</SelectItem>
                  <SelectItem value="KY">Kentucky</SelectItem>
                  <SelectItem value="LA">Louisiana</SelectItem>
                  <SelectItem value="ME">Maine</SelectItem>
                  <SelectItem value="MD">Maryland</SelectItem>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="MI">Michigan</SelectItem>
                  <SelectItem value="MN">Minnesota</SelectItem>
                  <SelectItem value="MS">Mississippi</SelectItem>
                  <SelectItem value="MO">Missouri</SelectItem>
                  <SelectItem value="MT">Montana</SelectItem>
                  <SelectItem value="NE">Nebraska</SelectItem>
                  <SelectItem value="NV">Nevada</SelectItem>
                  <SelectItem value="NH">New Hampshire</SelectItem>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="NM">New Mexico</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="ND">North Dakota</SelectItem>
                  <SelectItem value="OH">Ohio</SelectItem>
                  <SelectItem value="OK">Oklahoma</SelectItem>
                  <SelectItem value="OR">Oregon</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="RI">Rhode Island</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                  <SelectItem value="SD">South Dakota</SelectItem>
                  <SelectItem value="TN">Tennessee</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="UT">Utah</SelectItem>
                  <SelectItem value="VT">Vermont</SelectItem>
                  <SelectItem value="VA">Virginia</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="WV">West Virginia</SelectItem>
                  <SelectItem value="WI">Wisconsin</SelectItem>
                  <SelectItem value="WY">Wyoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="income">Annual Income</Label>
              <Input id="income" type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
            </div>

            <div>
              <Label htmlFor="filing-status">Filing Status</Label>
              <Select value={filingStatus} onValueChange={setFilingStatus}>
                <SelectTrigger id="filing-status">
                  <SelectValue placeholder="Select filing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculateTax} className="mt-4" disabled={loading}>
            {loading ? "Calculating..." : "Calculate Tax"}
          </Button>
        </CardContent>
      </Card>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
