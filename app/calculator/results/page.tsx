"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateOptimalTaxStates } from "@/app/actions"
import type { TaxCalculationResult } from "@/lib/tax-calculator"
import { stateTaxData } from "@/lib/state-tax-data"

export default function ResultsPage() {
  const [results, setResults] = useState<TaxCalculationResult[]>([])
  const [currentStateTax, setCurrentStateTax] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLifestyle, setUserLifestyle] = useState<string>("")
  const [userRegion, setUserRegion] = useState<string>("")

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

        // Combine all form data
        const formData = new FormData()

        // Add basic info
        formData.append("residenceState", basicInfo.residenceState || "")
        formData.append("employmentState", basicInfo.employmentState || "")
        formData.append("filingStatus", basicInfo.filingStatus || "")
        formData.append("preferredLifestyle", basicInfo.preferredLifestyle || "")
        formData.append("dependents", basicInfo.dependents || "0")

        // Add income info
        formData.append("annualIncome", incomeInfo.annualIncome || "0")
        formData.append("retirementIncome", incomeInfo.retirementIncome || "0")
        formData.append("socialSecurityIncome", incomeInfo.retirementIncome || "0")
        formData.append("pensionIncome", "0")
        formData.append("iraDistributions", incomeInfo.iraDistributions || "0")
        formData.append("investmentIncome", incomeInfo.investmentIncome || "0")
        formData.append("rentalIncome", incomeInfo.rentalIncome || "0")
        formData.append("royaltyIncome", incomeInfo.royaltyIncome || "0")
        formData.append("trustIncome", incomeInfo.trustIncome || "0")

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
          assetsInfo.vehicleInputs.forEach((vehicle, index) => {
            formData.append(`vehicle-${index + 1}`, vehicle.value || "0")
          })
        }

        // Calculate optimal tax states
        const result = await calculateOptimalTaxStates(formData)

        if (result.error) {
          setError(result.error)
          setLoading(false)
          return
        }

        // Set results
        setResults(result.recommendations)

        // Find current state tax burden
        const currentState = result.recommendations.find((state) => state.stateCode === basicInfo.residenceState)

        if (currentState) {
          setCurrentStateTax(currentState.totalTaxBurden)
        } else if (result.recommendations.length > 0) {
          // If current state not found in recommendations, use the first state's tax burden
          // This is a fallback to prevent errors
          setCurrentStateTax(result.recommendations[0].totalTaxBurden)
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

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
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary text-white`}
              >
                {i < 5 ? <CheckCircle className="h-5 w-5" /> : 5}
              </div>
              <span className="mt-2 text-xs font-medium">
                {i === 1 ? "Basic Info" : i === 2 ? "Income" : i === 3 ? "Assets" : i === 4 ? "Expenses" : "Results"}
              </span>
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
              {results.slice(0, 5).map((result, index) => (
                <div key={result.stateCode} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      {index + 1}
                    </div>
                    <span className="ml-3 font-medium">{result.stateName}</span>
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
                <p className="text-muted-foreground">Current State Tax Burden:</p>
                <p className="text-muted-foreground">Optimized State Tax Burden:</p>
                <p className="mt-2 font-medium">Potential Annual Savings:</p>
              </div>
              <div className="text-right">
                <p>{formatCurrency(currentStateTax)}</p>
                <p>{formatCurrency(results[0]?.totalTaxBurden || 0)}</p>
                <p className="mt-2 text-xl font-bold text-primary">
                  {formatCurrency(results[0]?.estimatedAnnualSavings || 0)}
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
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Income Tax</h3>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(results[0].incomeTaxBurden)}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Retirement Tax</h3>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(results[0].retirementTaxBurden)}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Property Tax</h3>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(results[0].propertyTaxBurden)}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Sales Tax</h3>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(results[0].salesTaxBurden)}</div>
                  </div>
                </div>

                {/* Add vehicle tax details */}
                {results[0].vehicleTaxBurden > 0 && (
                  <div className="mt-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Vehicle Tax</h3>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(results[0].vehicleTaxBurden)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {results[0].stateCode && results[0].stateCode in stateTaxData
                          ? stateTaxData[results[0].stateCode]?.vehicleTax?.specialAssessmentRules ||
                            "Based on vehicle value and state-specific rules"
                          : "Based on vehicle value and state-specific rules"}
                      </p>
                    </div>
                  </div>
                )}
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
      </div>
    </div>
  )
}
