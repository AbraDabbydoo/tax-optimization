"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function IncomePage() {
  const [annualIncome, setAnnualIncome] = useState("")
  const [retirementIncome, setRetirementIncome] = useState("")
  const [investmentIncome, setInvestmentIncome] = useState("")
  const [rentalIncome, setRentalIncome] = useState("")
  const [royaltyIncome, setRoyaltyIncome] = useState("")
  const [trustIncome, setTrustIncome] = useState("")
  const [iraDistributions, setIraDistributions] = useState("")
  const [hasRetirementIncome, setHasRetirementIncome] = useState("no")
  const [hasInvestmentIncome, setHasInvestmentIncome] = useState("no")
  const [pensionIncome, setPensionIncome] = useState("")
  const [militaryRetirementPay, setMilitaryRetirementPay] = useState("")
  const [errors, setErrors] = useState({
    annualIncome: false,
  })
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load saved form data when component mounts
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("taxCalculator_incomeInfo")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setAnnualIncome(parsedData.annualIncome || "")
        setRetirementIncome(parsedData.retirementIncome || "")
        setInvestmentIncome(parsedData.investmentIncome || "")
        setRentalIncome(parsedData.rentalIncome || "")
        setRoyaltyIncome(parsedData.royaltyIncome || "")
        setTrustIncome(parsedData.trustIncome || "")
        setIraDistributions(parsedData.iraDistributions || "")
        setHasRetirementIncome(parsedData.hasRetirementIncome || "no")
        setHasInvestmentIncome(parsedData.hasInvestmentIncome || "no")
        setPensionIncome(parsedData.pensionIncome || "")
        setMilitaryRetirementPay(parsedData.militaryRetirementPay || "")
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      setLoadError("Failed to load saved data. Starting with empty form.")
    }
  }, [])

  // Save form data when values change
  useEffect(() => {
    try {
      const formData = {
        annualIncome,
        retirementIncome,
        investmentIncome,
        rentalIncome,
        royaltyIncome,
        trustIncome,
        iraDistributions,
        hasRetirementIncome,
        hasInvestmentIncome,
        pensionIncome,
        militaryRetirementPay,
      }
      localStorage.setItem("taxCalculator_incomeInfo", JSON.stringify(formData))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }, [
    annualIncome,
    retirementIncome,
    investmentIncome,
    rentalIncome,
    royaltyIncome,
    trustIncome,
    iraDistributions,
    hasRetirementIncome,
    hasInvestmentIncome,
    pensionIncome,
    militaryRetirementPay,
  ])

  const handleNextStep = () => {
    // Validate form
    const newErrors = {
      annualIncome: !annualIncome,
    }

    setErrors(newErrors)

    // If no errors, proceed to next step
    if (!Object.values(newErrors).some(Boolean)) {
      // Form data is already saved in localStorage via the useEffect
      window.location.href = "/calculator/payment"
    }
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
        <h1 className="text-3xl font-bold">Tax Optimization Analysis</h1>
        <p className="text-muted-foreground">Tell us about your income to help us calculate your tax burden.</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  i <= 2 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {i}
              </div>
              <span className="mt-2 text-xs font-medium">
                {i === 1 ? "Basic Info" : i === 2 ? "Income" : i === 3 ? "Assets" : i === 4 ? "Expenses" : "Results"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "20%" }}></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Information</CardTitle>
          <CardDescription>Tell us about your income sources to help us calculate your tax burden.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="annualIncome">
              Annual Income <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="annualIncome"
                className={`pl-9 ${errors.annualIncome ? "border-red-500" : ""}`}
                placeholder="75,000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
              />
            </div>
            {errors.annualIncome && <p className="text-sm text-red-500">Please enter your annual income</p>}
            <p className="text-xs text-muted-foreground">Enter your gross annual income before taxes and deductions.</p>
          </div>

          <div className="space-y-2">
            <Label>Do you have retirement income?</Label>
            <RadioGroup value={hasRetirementIncome} onValueChange={setHasRetirementIncome}>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="yes" id="retirement-yes" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="retirement-yes" className="font-medium">
                    Yes
                  </Label>
                  <p className="text-sm text-muted-foreground">I receive retirement income</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="no" id="retirement-no" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="retirement-no" className="font-medium">
                    No
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    I don't receive retirement income or I am not retired.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {hasRetirementIncome === "yes" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="retirementIncome">Social Security Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="retirementIncome"
                    className="pl-9"
                    placeholder="24,000"
                    value={retirementIncome}
                    onChange={(e) => setRetirementIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual Social Security benefits, if applicable.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iraDistributions">IRA/401(k) Distributions</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="iraDistributions"
                    className="pl-9"
                    placeholder="12,000"
                    value={iraDistributions}
                    onChange={(e) => setIraDistributions(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual distributions from retirement accounts.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pensionIncome">Pension Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pensionIncome"
                    className="pl-9"
                    placeholder="18,000"
                    value={pensionIncome}
                    onChange={(e) => setPensionIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your yearly pension benefits, if applicable.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="militaryRetirementPay">Military Retirement Pay</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="militaryRetirementPay"
                    className="pl-9"
                    placeholder="30,000"
                    value={militaryRetirementPay}
                    onChange={(e) => setMilitaryRetirementPay(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your yearly military retirement benefits, if applicable.
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Do you have investment or passive income?</Label>
            <RadioGroup value={hasInvestmentIncome} onValueChange={setHasInvestmentIncome}>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="yes" id="investment-yes" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="investment-yes" className="font-medium">
                    Yes
                  </Label>
                  <p className="text-sm text-muted-foreground">I receive investment or passive income</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="no" id="investment-no" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="investment-no" className="font-medium">
                    No
                  </Label>
                  <p className="text-sm text-muted-foreground">I don't receive investment or passive income</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {hasInvestmentIncome === "yes" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="investmentIncome">Investment Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="investmentIncome"
                    className="pl-9"
                    placeholder="5,000"
                    value={investmentIncome}
                    onChange={(e) => setInvestmentIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual income from dividends, interest, and capital gains.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rentalIncome">Rental Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rentalIncome"
                    className="pl-9"
                    placeholder="12,000"
                    value={rentalIncome}
                    onChange={(e) => setRentalIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your annual income from rental properties.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="royaltyIncome">Royalty Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="royaltyIncome"
                    className="pl-9"
                    placeholder="0"
                    value={royaltyIncome}
                    onChange={(e) => setRoyaltyIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual income from royalties (books, patents, etc.).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trustIncome">Trust Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="trustIncome"
                    className="pl-9"
                    placeholder="0"
                    value={trustIncome}
                    onChange={(e) => setTrustIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your annual income from trusts.</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/calculator">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button onClick={handleNextStep}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
