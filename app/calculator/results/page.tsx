"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateOptimalTaxStates } from "@/app/actions"
import type { TaxCalculationResult } from "@/lib/tax-calculator"
import { stateTaxData } from "@/lib/state-tax-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define a formatCurrency function if it's not available from utils
// Update the formatCurrency function to handle NaN values
const formatCurrency = (amount: number) => {
  // Check if amount is NaN and return $0 instead
  if (isNaN(amount)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(0)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

// State name mapping
const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
}

export default function ResultsPage() {
  const [results, setResults] = useState<TaxCalculationResult[]>([])
  const [currentStateTax, setCurrentStateTax] = useState(0)
  const [currentStateCode, setCurrentStateCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLifestyle, setUserLifestyle] = useState<string>("")
  const [userRegion, setUserRegion] = useState<string>("")

  // Add state for current state tax breakdown
  const [currentStateTaxBreakdown, setCurrentStateTaxBreakdown] = useState({
    incomeTaxBurden: 0,
    retirementTaxBurden: 0,
    propertyTaxBurden: 0,
    salesTaxBurden: 0,
    vehicleTaxBurden: 0,
  })

  // Add a new state to track the selected recommended state index
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0)

  useEffect(() => {
    async function processResults() {
      try {
        // Get all form data from localStorage
        const basicInfo = JSON.parse(localStorage.getItem("taxCalculator_basicInfo") || "{}")
        const incomeInfo = JSON.parse(localStorage.getItem("taxCalculator_incomeInfo") || "{}")
        const assetsInfo = JSON.parse(localStorage.getItem("taxCalculator_assetsInfo") || "{}")
        const expensesInfo = JSON.parse(localStorage.getItem("taxCalculator_expensesInfo") || "{}")

        // Store the user's preferences for display
        setUserLifestyle(basicInfo.preferredLifestyle || "")
        setUserRegion(assetsInfo.regionPreference || "")

        // Store the current state code
        setCurrentStateCode(basicInfo.residenceState || "")

        console.log("Basic info:", basicInfo)
        console.log("Current state:", basicInfo.residenceState)
        console.log("Income info:", incomeInfo)

        // Combine all form data
        const formData = new FormData()

        // Add basic info
        formData.append("residenceState", basicInfo.residenceState || "")
        formData.append("employmentState", basicInfo.employmentState || "")
        formData.append("filingStatus", basicInfo.filingStatus || "")
        formData.append("preferredLifestyle", basicInfo.preferredLifestyle || "")
        formData.append("dependents", basicInfo.dependents || "0")
        formData.append("qualifyingChildren", basicInfo.qualifyingChildren || "0")
        formData.append("age", basicInfo.age || "65")
        formData.append("spouseAge", basicInfo.spouseAge || "65")

        // Add income info - ensure these are strings
        formData.append("annualIncome", (incomeInfo.annualIncome || "0").toString())
        formData.append("retirementIncome", (incomeInfo.retirementIncome || "0").toString())
        formData.append("socialSecurityIncome", (incomeInfo.socialSecurityIncome || "0").toString())
        formData.append("privatePensionIncome", (incomeInfo.privatePensionIncome || "0").toString())
        formData.append("pensionIncome", (incomeInfo.pensionIncome || "0").toString())
        formData.append("iraDistributions", (incomeInfo.iraDistributions || "0").toString())
        formData.append("investmentIncome", (incomeInfo.investmentIncome || "0").toString())
        formData.append("interestIncome", (incomeInfo.interestIncome || "0").toString())
        formData.append("dividendsIncome", (incomeInfo.dividendsIncome || "0").toString())
        formData.append("rentalIncome", (incomeInfo.rentalIncome || "0").toString())
        formData.append("royaltyIncome", (incomeInfo.royaltyIncome || "0").toString())
        formData.append("trustIncome", (incomeInfo.trustIncome || "0").toString())
        formData.append("privatePensionEmployeeContributionPortion", incomeInfo.privatePensionEmployeeContributionPortion || "")
        formData.append("kyMilitaryRetiredBefore1998", incomeInfo.kyMilitaryRetiredBefore1998 || "no")
        formData.append("kyTeacherPoliceFirePre1998Percent", (incomeInfo.kyTeacherPoliceFirePre1998Percent || "0").toString())
        formData.append("ncBaileyExemption", (incomeInfo.ncBaileyExemption || "no").toString())

        // Add assets info
        formData.append("homeValue", assetsInfo.homeValue || "0")
        formData.append("propertyTax", assetsInfo.propertyTax || "0")
        formData.append("currentRent", assetsInfo.currentRent || "0")
        formData.append("futurePlans", assetsInfo.futurePlans || "")
        formData.append("housingBudget", assetsInfo.housingBudget || "0")
        formData.append("hasDependents", assetsInfo.hasDependents || "no")
        formData.append("regionPreference", assetsInfo.regionPreference || "")
        formData.append("vehicleCount", assetsInfo.vehicleCount || "0")
        formData.append("vehicleValue", assetsInfo.vehicleValue || "0")

        // Add expenses info
        formData.append("groceries", expensesInfo.groceries || "0")
        formData.append("preparedFood", expensesInfo.preparedFood || "0")
        formData.append("utilities", expensesInfo.utilities || "0")
        formData.append("services", expensesInfo.services || "0")
        formData.append("digitalGoods", expensesInfo.digitalGoods || "0")
        formData.append("medicine", expensesInfo.medicine || "0")
        formData.append("streamingSubscriptions", expensesInfo.streamingSubscriptions || "0")

        // Add individual vehicle data if available
        if (assetsInfo.vehicleInputs && Array.isArray(assetsInfo.vehicleInputs)) {
          assetsInfo.vehicleInputs.forEach((vehicle: { value: string | number }, index: number) => {
            formData.append(`vehicle-${index + 1}`, vehicle.value?.toString() || "0")
          })
        }

        // Log the form data for debugging
        console.log("Combined form data:", Object.fromEntries(formData.entries()))

        // Calculate optimal tax states
        const result = await calculateOptimalTaxStates(formData)

        console.log("Calculation result:", result)

        if (result.error) {
          setError(result.error)
          setLoading(false)
          return
        }

        // Set results - add fallback empty array to prevent undefined errors
        setResults(result.recommendations || [])

        // Find current state tax burden
        const currentState = result.recommendations?.find((state) => state.stateCode === basicInfo.residenceState)

        console.log("Current state found:", currentState)

        if (currentState) {
          setCurrentStateTax(currentState.totalTaxBurden)

          // Set the current state tax breakdown
          setCurrentStateTaxBreakdown({
            incomeTaxBurden: currentState.incomeTaxBurden || 0,
            retirementTaxBurden: currentState.retirementTaxBurden || 0,
            propertyTaxBurden: currentState.propertyTaxBurden || 0,
            salesTaxBurden: currentState.salesTaxBurden || 0,
            vehicleTaxBurden: currentState.vehicleTaxBurden || 0,
          })
        } else {
          // If current state not found in recommendations, we need to calculate it separately
          console.log("Current state not found in recommendations, calculating separately...")

          try {
            // Make a direct API call to calculate the current state tax
            const response = await fetch("/api/debug/calculate-tax", {
              method: "POST",
              body: formData,
            })

            if (response.ok) {
              const currentStateTaxData = await response.json()
              console.log("Current state tax calculated separately:", currentStateTaxData)
              setCurrentStateTax(currentStateTaxData.totalTaxBurden)

              // Set the current state tax breakdown from the API response
              setCurrentStateTaxBreakdown({
                incomeTaxBurden: currentStateTaxData.incomeTaxBurden || 0,
                retirementTaxBurden: currentStateTaxData.retirementTaxBurden || 0,
                propertyTaxBurden: currentStateTaxData.propertyTaxBurden || 0,
                salesTaxBurden: currentStateTaxData.salesTaxBurden || 0,
                vehicleTaxBurden: currentStateTaxData.vehicleTaxBurden || 0,
              })
            } else {
              console.error("Failed to calculate current state tax separately")
              // Fallback to first recommendation's tax burden
              if (result.recommendations && result.recommendations.length > 0) {
                setCurrentStateTax(result.recommendations[0].totalTaxBurden)
              }
            }
          } catch (err) {
            console.error("Error calculating current state tax separately:", err)
            // Fallback to first recommendation's tax burden
            if (result.recommendations && result.recommendations.length > 0) {
              setCurrentStateTax(result.recommendations[0].totalTaxBurden)
            }
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error calculating results:", err)
        setError("There was an error calculating your results. Please try again.")
        setLoading(false)
      }
    }

    processResults()
  }, [])

  // Format lifestyle for display
  const formatLifestyle = (lifestyle: string) => {
    if (!lifestyle || lifestyle === "indifferent") return "No preference"
    return lifestyle.charAt(0).toUpperCase() + lifestyle.slice(1)
  }

  // Format region for display
  const formatRegion = (region: string) => {
    if (!region || region === "indifferent") return "No preference"
    return region
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get state name from state code
  const getStateName = (stateCode: string) => {
    return stateNames[stateCode] || stateCode
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Calculating Your Optimal Tax States...</h2>
            <p className="text-muted-foreground">
              We're analyzing tax data across all 50 states to find your best options.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-red-500">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/calculator">Try Again</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Tax Optimization Results</h1>
        <p className="text-muted-foreground">
          Based on your information, here are the best states for your tax situation.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <Link
                href={i < 5 ? (i === 1 ? "/calculator" : `/calculator/step-${i}`) : "#"}
                className={i < 5 ? "" : "pointer-events-none"}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    i <= 5 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  {i === 5 ? <CheckCircle className="h-5 w-5" /> : i}
                </div>
                <span className="mt-2 text-xs font-medium">
                  {i === 1 ? "Basic Info" : i === 2 ? "Income" : i === 3 ? "Assets" : i === 4 ? "Expenses" : "Results"}
                </span>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "100%" }}></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Preferences summary card */}
        {(userLifestyle !== "indifferent" && userLifestyle !== "") ||
        (userRegion !== "indifferent" && userRegion !== "") ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
              <CardDescription>We've filtered states based on your preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userLifestyle && userLifestyle !== "indifferent" && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lifestyle:</span>
                    <span className="font-medium">{formatLifestyle(userLifestyle)}</span>
                  </div>
                )}
                {userRegion && userRegion !== "indifferent" && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span className="font-medium">{formatRegion(userRegion)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Your Top 5 Tax-Optimized States</CardTitle>
            <CardDescription>These states offer the best tax advantages for your specific situation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(results || []).slice(0, 5).map((result, index) => (
                <div key={result.stateCode} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      {index + 1}
                    </div>
                    <span className="ml-3 font-medium">
                      {getStateName(result.stateCode)} ({result.stateCode})
                    </span>
                    <div className="ml-2 flex space-x-1">
                      {userLifestyle && userLifestyle !== "indifferent" && result.lifestyleMatch && (
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {formatLifestyle(userLifestyle)}
                        </span>
                      )}
                      {userRegion && userRegion !== "indifferent" && result.regionMatch && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {formatRegion(userRegion)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary">{formatCurrency(result.totalTaxBurden)}</span>
                    <span className="block text-xs text-muted-foreground">Est. State Tax</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potential Annual Savings</CardTitle>
            <CardDescription>
              Here's how much you could save by relocating to one of our recommended states.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Current State Tax Burden ({getStateName(currentStateCode)}):</p>
                <p className="text-muted-foreground">
                  Optimized State Tax Burden ({getStateName(results[selectedStateIndex]?.stateCode)}):{" "}
                </p>
                <p className="mt-2 font-medium">Potential Annual Savings:</p>
              </div>
              <div className="text-right">
                <p>{formatCurrency(currentStateTax)}</p>
                <p>{formatCurrency(results[selectedStateIndex]?.totalTaxBurden || 0)}</p>
                <p className="mt-2 text-xl font-bold text-primary">
                  {formatCurrency(Math.max(0, currentStateTax - (results[selectedStateIndex]?.totalTaxBurden || 0)))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Breakdown by Category</CardTitle>
            <CardDescription>See how different types of taxes affect your overall tax burden.</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 && (
              <div className="space-y-6">
                {/* Current State Tax Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Current State: {getStateName(currentStateCode)}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Income Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(currentStateTaxBreakdown.incomeTaxBurden)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Retirement Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(currentStateTaxBreakdown.retirementTaxBurden)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Property Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(currentStateTaxBreakdown.propertyTaxBurden)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Sales Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(currentStateTaxBreakdown.salesTaxBurden)}
                      </div>
                    </div>
                  </div>

                  {/* Add vehicle tax details for current state */}
                  {currentStateTaxBreakdown.vehicleTaxBurden > 0 && (
                    <div className="mt-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-2">Vehicle Tax</h3>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(currentStateTaxBreakdown.vehicleTaxBurden)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {currentStateCode && currentStateCode in stateTaxData
                            ? stateTaxData[currentStateCode]?.vehicleTax?.specialAssessmentRules ||
                              "Based on vehicle value and state-specific rules"
                            : "Based on vehicle value and state-specific rules"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Compared To</span>
                  </div>
                </div>

                {/* Recommended State Tax Breakdown */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Recommended State:</h3>
                    <Select
                      value={selectedStateIndex.toString()}
                      onValueChange={(value) => setSelectedStateIndex(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a state">
                          {getStateName(results[selectedStateIndex]?.stateCode)} (
                          {results[selectedStateIndex]?.stateCode})
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {results.map((result, index) => (
                          <SelectItem key={result.stateCode} value={index.toString()}>
                            {getStateName(result.stateCode)} ({result.stateCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Income Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results[selectedStateIndex]?.incomeTaxBurden || 0)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Retirement Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results[selectedStateIndex]?.retirementTaxBurden || 0)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Property Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results[selectedStateIndex]?.propertyTaxBurden || 0)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Sales Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results[selectedStateIndex]?.salesTaxBurden || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Add vehicle tax details for recommended state */}
                  {results[selectedStateIndex]?.vehicleTaxBurden > 0 && (
                    <div className="mt-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium mb-2">Vehicle Tax</h3>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(results[selectedStateIndex]?.vehicleTaxBurden || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {results[selectedStateIndex]?.stateCode &&
                          results[selectedStateIndex]?.stateCode in stateTaxData
                            ? stateTaxData[results[selectedStateIndex]?.stateCode]?.vehicleTax
                                ?.specialAssessmentRules || "Based on vehicle value and state-specific rules"
                            : "Based on vehicle value and state-specific rules"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Here's what you can do with your tax optimization analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                <span>Download your full tax optimization report</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                <span>Schedule a follow-up consultation with a CPA</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 h-5 w-5 text-primary mt-0.5" />
                <span>Explore detailed cost of living comparisons</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button>
              <Download className="mr-2 h-4 w-4" /> Download Full Report
            </Button>
            <Button variant="outline" asChild>
              <Link href="/consultation">Book a CPA Consultation</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Add a Clear Data button */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Calculator</CardTitle>
            <CardDescription>Clear all saved data and start over.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                // Clear all localStorage items for your application
                localStorage.removeItem("taxCalculator_basicInfo")
                localStorage.removeItem("taxCalculator_incomeInfo")
                localStorage.removeItem("taxCalculator_assetsInfo")
                localStorage.removeItem("taxCalculator_expensesInfo")
                // Redirect to home page
                window.location.href = "/"
              }}
              variant="outline"
              className="w-full"
            >
              Clear Saved Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
