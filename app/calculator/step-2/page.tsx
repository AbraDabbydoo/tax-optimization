"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip } from "@/components/ui/tooltip"

export default function IncomePage() {
  const [annualIncome, setAnnualIncome] = useState("")
  const [socialSecurityIncome, setSocialSecurityIncome] = useState("")
  const [investmentIncome, setInvestmentIncome] = useState("")
  const [interestIncome, setInterestIncome] = useState("")
  const [dividendsIncome, setDividendsIncome] = useState("")
  const [rentalIncome, setRentalIncome] = useState("")
  const [royaltyIncome, setRoyaltyIncome] = useState("")
  const [trustIncome, setTrustIncome] = useState("")
  const [iraDistributions, setIraDistributions] = useState("")
  const [hasRetirementIncome, setHasRetirementIncome] = useState("no")
  const [hasInvestmentIncome, setHasInvestmentIncome] = useState("no")
  const [hasPublicPension, setHasPublicPension] = useState("no")
  const [privatePensionIncome, setPrivatePensionIncome] = useState("")
  const [teacherPension, setTeacherPension] = useState("")
  const [policePension, setPolicePension] = useState("")
  const [firefighterPension, setFirefighterPension] = useState("")
  const [otherGovernmentPension, setOtherGovernmentPension] = useState("")
  const [militaryRetirementPay, setMilitaryRetirementPay] = useState("")
  const [spouse1QualifyingJob, setSpouse1QualifyingJob] = useState("no")
  const [spouse2QualifyingJob, setSpouse2QualifyingJob] = useState("no")
  const [isArizonaResident, setIsArizonaResident] = useState(false)
  const [filingStatus, setFilingStatus] = useState("single")
  const [errors, setErrors] = useState({
    annualIncome: false,
  })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [privatePensionEmployeeContributionPortion, setPrivatePensionEmployeeContributionPortion] = useState("")
  const [residenceState, setResidenceState] = useState("")
  const [kyMilitaryRetiredBefore1998, setKyMilitaryRetiredBefore1998] = useState("no")
  const [kyTeacherPoliceFirePre1998Percent, setKyTeacherPoliceFirePre1998Percent] = useState("")
  const [ncBaileyExemption, setNcBaileyExemption] = useState("")
  
  // Add missing state variables
  const [selfEmploymentIncome, setSelfEmploymentIncome] = useState("")
  const [shortTermCapitalGains, setShortTermCapitalGains] = useState("")
  const [longTermCapitalGains, setLongTermCapitalGains] = useState("")
  const [unemploymentIncome, setUnemploymentIncome] = useState("")
  const [alimonyPaid, setAlimonyPaid] = useState("")
  const [alimonyReceived, setAlimonyReceived] = useState("")
  const [alimonyDivorceDate, setAlimonyDivorceDate] = useState("")
  const [gamblingWinnings, setGamblingWinnings] = useState("")
  const [alimonyStatus, setAlimonyStatus] = useState("no");

  // Load saved form data when component mounts
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("taxCalculator_incomeInfo")
      const basicInfo = localStorage.getItem("taxCalculator_basicInfo")
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setAnnualIncome(parsedData.annualIncome || "")
        setSocialSecurityIncome(parsedData.socialSecurityIncome || "")
        setInvestmentIncome(parsedData.investmentIncome || "")
        setInterestIncome(parsedData.interestIncome || "")
        setDividendsIncome(parsedData.dividendsIncome || "")
        setRentalIncome(parsedData.rentalIncome || "")
        setRoyaltyIncome(parsedData.royaltyIncome || "")
        setTrustIncome(parsedData.trustIncome || "")
        setIraDistributions(parsedData.iraDistributions || "")
        setHasRetirementIncome(parsedData.hasRetirementIncome || "no")
        setHasInvestmentIncome(parsedData.hasInvestmentIncome || "no")
        setHasPublicPension(parsedData.hasPublicPension || "no")
        setPrivatePensionIncome(parsedData.privatePensionIncome || "")
        setTeacherPension(parsedData.teacherPension || "")
        setPolicePension(parsedData.policePension || "")
        setFirefighterPension(parsedData.firefighterPension || "")
        setOtherGovernmentPension(parsedData.otherGovernmentPension || "")
        setMilitaryRetirementPay(parsedData.militaryRetirementPay || "")
        setSpouse1QualifyingJob(parsedData.spouse1QualifyingJob || "no")
        setSpouse2QualifyingJob(parsedData.spouse2QualifyingJob || "no")
        setPrivatePensionEmployeeContributionPortion(parsedData.privatePensionEmployeeContributionPortion || "")
        setKyMilitaryRetiredBefore1998(parsedData.kyMilitaryRetiredBefore1998 || "no")
        setKyTeacherPoliceFirePre1998Percent(parsedData.kyTeacherPoliceFirePre1998Percent || "")
        setNcBaileyExemption(parsedData.ncBaileyExemption || "")
        
        // Load new fields
        setSelfEmploymentIncome(parsedData.selfEmploymentIncome || "")
        setShortTermCapitalGains(parsedData.shortTermCapitalGains || "")
        setLongTermCapitalGains(parsedData.longTermCapitalGains || "")
        setUnemploymentIncome(parsedData.unemploymentIncome || "")
        setAlimonyPaid(parsedData.alimonyPaid || "")
        setAlimonyReceived(parsedData.alimonyReceived || "")
        setAlimonyDivorceDate(parsedData.alimonyDivorceDate || "")
        setGamblingWinnings(parsedData.gamblingWinnings || "")
      }
      
      // Load alimony status from basic info
      if (basicInfo) {
        const parsedBasicInfo = JSON.parse(basicInfo)
        setAlimonyStatus(parsedBasicInfo.alimonyStatus || "no")
      }
      
      // Check if Arizona is selected as residence or employment state
      if (basicInfo) {
        const parsedBasicInfo = JSON.parse(basicInfo)
        const residenceState = parsedBasicInfo.residenceState || ""
        const employmentState = parsedBasicInfo.employmentState || ""
        const filingStatusFromBasic = parsedBasicInfo.filingStatus || "single"
        
        setIsArizonaResident(residenceState === "AZ" || employmentState === "AZ")
        setFilingStatus(filingStatusFromBasic)
        setResidenceState(residenceState)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      setLoadError("Failed to load saved data. Starting with empty form.")
    }
  }, [])

  useEffect(() => {
    const basicInfo = localStorage.getItem("taxCalculator_basicInfo");
    if (basicInfo) {
      const parsed = JSON.parse(basicInfo);
      setAlimonyStatus(parsed.alimonyStatus || "no");
    }
  }, []);

  // Save form data when values change
  useEffect(() => {
    try {
      const formData = {
        annualIncome,
        socialSecurityIncome,
        investmentIncome,
        interestIncome,
        dividendsIncome,
        rentalIncome,
        royaltyIncome,
        trustIncome,
        iraDistributions,
        hasRetirementIncome,
        hasInvestmentIncome,
        hasPublicPension,
        privatePensionIncome,
        teacherPension,
        policePension,
        firefighterPension,
        otherGovernmentPension,
        militaryRetirementPay,
        spouse1QualifyingJob,
        spouse2QualifyingJob,
        privatePensionEmployeeContributionPortion,
        kyMilitaryRetiredBefore1998,
        kyTeacherPoliceFirePre1998Percent,
        ncBaileyExemption,
        
        // Save new fields
        selfEmploymentIncome,
        shortTermCapitalGains,
        longTermCapitalGains,
        unemploymentIncome,
        alimonyPaid,
        alimonyReceived,
        alimonyDivorceDate,
        gamblingWinnings,
        alimonyStatus,
      }
      localStorage.setItem("taxCalculator_incomeInfo", JSON.stringify(formData))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }, [
    annualIncome,
    socialSecurityIncome,
    investmentIncome,
    interestIncome,
    dividendsIncome,
    rentalIncome,
    royaltyIncome,
    trustIncome,
    iraDistributions,
    hasRetirementIncome,
    hasInvestmentIncome,
    hasPublicPension,
    privatePensionIncome,
    teacherPension,
    policePension,
    firefighterPension,
    otherGovernmentPension,
    militaryRetirementPay,
    spouse1QualifyingJob,
    spouse2QualifyingJob,
    privatePensionEmployeeContributionPortion,
    kyMilitaryRetiredBefore1998,
    kyTeacherPoliceFirePre1998Percent,
    ncBaileyExemption,
    
    // Add new fields to dependency array
    selfEmploymentIncome,
    shortTermCapitalGains,
    longTermCapitalGains,
    unemploymentIncome,
    alimonyPaid,
    alimonyReceived,
    alimonyDivorceDate,
    gamblingWinnings,
    alimonyStatus,
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
      console.log("USER INPUTS:", {
        annualIncome,
        socialSecurityIncome,
        investmentIncome,
        interestIncome,
        dividendsIncome,
        rentalIncome,
        royaltyIncome,
        trustIncome,
        iraDistributions,
        hasRetirementIncome,
        hasInvestmentIncome,
        hasPublicPension,
        privatePensionIncome,
        teacherPension,
        policePension,
        firefighterPension,
        otherGovernmentPension,
        militaryRetirementPay,
        spouse1QualifyingJob,
        spouse2QualifyingJob,
        privatePensionEmployeeContributionPortion,
        kyMilitaryRetiredBefore1998,
        kyTeacherPoliceFirePre1998Percent,
        ncBaileyExemption,
        
        // Log new fields
        selfEmploymentIncome,
        shortTermCapitalGains,
        longTermCapitalGains,
        unemploymentIncome,
        alimonyPaid,
        alimonyReceived,
        alimonyDivorceDate,
        gamblingWinnings,
        alimonyStatus,
      })
      window.location.href = "/calculator/payment" // route to payment processor next
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...collect data and send to backend
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
                  i === 2 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {i}
              </div>
              <span className="mt-2 text-xs font-medium">
                {i === 1 ? "Basic Info" : i === 2 ? "Income" : i === 3 ? "Expenses, Deductions, Credits" : i === 4 ? "Assets" : "Results"}
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
                value={annualIncome ? Number(annualIncome.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setAnnualIncome(raw);
                }}
              />
            </div>
            {errors.annualIncome && <p className="text-sm text-red-500">Please enter your annual income </p>}
            <p className="text-xs text-muted-foreground">Enter your gross annual income before taxes and deductions from wages/salary.</p>
          </div>

          {/* Add new income fields here, before the retirement income section */}
          <div className="space-y-2">
            <Label htmlFor="selfEmploymentIncome">Self-Employment Income</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="selfEmploymentIncome"
                className="pl-9"
                placeholder="0"
                value={selfEmploymentIncome ? Number(selfEmploymentIncome.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setSelfEmploymentIncome(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your annual self-employment income.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unemploymentIncome">Unemployment Income</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="unemploymentIncome"
                className="pl-9"
                placeholder="0"
                value={unemploymentIncome ? Number(unemploymentIncome.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setUnemploymentIncome(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your annual unemployment benefits.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gamblingWinnings">Gambling Winnings</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="gamblingWinnings"
                className="pl-9"
                placeholder="0"
                value={gamblingWinnings ? Number(gamblingWinnings.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setGamblingWinnings(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your annual gambling winnings.</p>
          </div>

          {/* Keep all existing sections - retirement income, investment income, etc. */}
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
                <Label htmlFor="socialSecurityIncome">Social Security Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="socialSecurityIncome"
                    className="pl-9"
                    placeholder="24,000"
                    value={socialSecurityIncome ? Number(socialSecurityIncome.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setSocialSecurityIncome(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual Social Security benefits, if applicable.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iraDistributions">Traditional IRA/401(k) Distributions</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="iraDistributions"
                    className="pl-9"
                    placeholder="12,000"
                    value={iraDistributions ? Number(iraDistributions.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setIraDistributions(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual distributions from retirement accounts.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privatePensionIncome">Private Pension Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="privatePensionIncome"
                    className="pl-9"
                    placeholder="18,000"
                    value={privatePensionIncome}
                    onChange={e => setPrivatePensionIncome(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your yearly private pension benefits, if applicable.
                </p>
              </div>

              {/* Hawaii-specific: Employee-contributed portion of private pension */}
              {residenceState === "HI" && privatePensionIncome && (
                <div className="space-y-2">
                  <Label htmlFor="privatePensionEmployeeContributionPortion">
                    Employee-Contributed Portion of Private Pension
                    <span className="ml-1 text-xs text-muted-foreground">(Hawaii only)</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="privatePensionEmployeeContributionPortion"
                      className="pl-9"
                      placeholder="Amount you contributed"
                      value={privatePensionEmployeeContributionPortion}
                      onChange={e => setPrivatePensionEmployeeContributionPortion(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In Hawaii, only the portion of your private pension funded by your own contributions is taxable. The employer-funded portion is exempt. If you're unsure, check with your plan administrator.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Do you have public pension income? (Police, Teacher, Firefighter, etc.)</Label>
                <RadioGroup value={hasPublicPension} onValueChange={setHasPublicPension}>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="yes" id="public-pension-yes" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="public-pension-yes" className="font-medium">
                        Yes
                      </Label>
                      <p className="text-sm text-muted-foreground">I receive a public pension</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="no" id="public-pension-no" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="public-pension-no" className="font-medium">
                        No
                      </Label>
                      <p className="text-sm text-muted-foreground">I do not receive a public pension.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {hasPublicPension === "yes" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teacherPension">Teacher Pension</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="teacherPension"
                        className="pl-9"
                        placeholder="12,000"
                        value={teacherPension ? Number(teacherPension.replace(/,/g, "")).toLocaleString() : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) setTeacherPension(raw);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policePension">Police Pension</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="policePension"
                        className="pl-9"
                        placeholder="12,000"
                        value={policePension ? Number(policePension.replace(/,/g, "")).toLocaleString() : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) setPolicePension(raw);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firefighterPension">Firefighter Pension</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firefighterPension"
                        className="pl-9"
                        placeholder="12,000"
                        value={firefighterPension ? Number(firefighterPension.replace(/,/g, "")).toLocaleString() : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) setFirefighterPension(raw);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherGovernmentPension">Other Government Pension</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otherGovernmentPension"
                        className="pl-9"
                        placeholder="12,000"
                        value={otherGovernmentPension ? Number(otherGovernmentPension.replace(/,/g, "")).toLocaleString() : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) setOtherGovernmentPension(raw);
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Arizona-specific: Spouse qualifying job questions */}
              {isArizonaResident && (
                <div className="space-y-4 border-t pt-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Arizona Tax Exemption Information</Label>
                    <p className="text-sm text-muted-foreground">
                      Arizona offers special tax exemptions for teacher, police, and firefighter pensions. 
                      Please indicate if you or your spouse worked in these professions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Did you work as a teacher, police officer, or firefighter?</Label>
                    <RadioGroup value={spouse1QualifyingJob} onValueChange={setSpouse1QualifyingJob}>
                      <div className="flex items-start space-x-3 rounded-md border p-3">
                        <RadioGroupItem value="yes" id="spouse1-yes" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="spouse1-yes" className="font-medium">
                            Yes
                          </Label>
                          <p className="text-sm text-muted-foreground">I worked as a teacher, police officer, or firefighter</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-md border p-3">
                        <RadioGroupItem value="no" id="spouse1-no" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="spouse1-no" className="font-medium">
                            No
                          </Label>
                          <p className="text-sm text-muted-foreground">I did not work in these professions</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {filingStatus === "married-joint" && (
                    <div className="space-y-2">
                      <Label>Did your spouse work as a teacher, police officer, or firefighter?</Label>
                      <RadioGroup value={spouse2QualifyingJob} onValueChange={setSpouse2QualifyingJob}>
                        <div className="flex items-start space-x-3 rounded-md border p-3">
                          <RadioGroupItem value="yes" id="spouse2-yes" className="mt-1" />
                          <div className="space-y-1">
                            <Label htmlFor="spouse2-yes" className="font-medium">
                              Yes
                            </Label>
                            <p className="text-sm text-muted-foreground">My spouse worked as a teacher, police officer, or firefighter</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 rounded-md border p-3">
                          <RadioGroupItem value="no" id="spouse2-no" className="mt-1" />
                          <div className="space-y-1">
                            <Label htmlFor="spouse2-no" className="font-medium">
                              No
                            </Label>
                            <p className="text-sm text-muted-foreground">My spouse did not work in these professions</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              )}
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
                <Label htmlFor="shortTermCapitalGains">Short Term Capital Gains (Sold before 12 months)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shortTermCapitalGains"
                    className="pl-9"
                    placeholder="0"
                    value={shortTermCapitalGains ? Number(shortTermCapitalGains.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setShortTermCapitalGains(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your short-term capital gains (assets sold before 12 months).
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longTermCapitalGains">Long Term Capital Gains (Held longer than 12 Months)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="longTermCapitalGains"
                    className="pl-9"
                    placeholder="0"
                    value={longTermCapitalGains ? Number(longTermCapitalGains.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setLongTermCapitalGains(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your long-term capital gains (assets held longer than 12 months).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestIncome">Interest Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="interestIncome"
                    className="pl-9"
                    placeholder="1,000"
                    value={interestIncome ? Number(interestIncome.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setInterestIncome(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual income from interest-bearing accounts.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dividendsIncome">Dividends Income</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dividendsIncome"
                    className="pl-9"
                    placeholder="2,000"
                    value={dividendsIncome ? Number(dividendsIncome.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setDividendsIncome(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your annual income from dividends.
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
                    value={rentalIncome ? Number(rentalIncome.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setRentalIncome(raw);
                    }}
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
                    value={royaltyIncome ? Number(royaltyIncome.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setRoyaltyIncome(raw);
                    }}
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
                    value={trustIncome ? Number(trustIncome.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setTrustIncome(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your annual income from trusts.</p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="militaryRetirementPay">Military Retirement Pay</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="militaryRetirementPay"
                className="pl-9"
                placeholder="30,000"
                value={militaryRetirementPay ? Number(militaryRetirementPay.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setMilitaryRetirementPay(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your yearly military retirement pay, if applicable.
            </p>
          </div>

          {/* Kentucky-specific: Pre-1998 service questions */}
          {residenceState === "KY" && (
            <>
              <div className="space-y-2">
                <Label>Were you retired from the military before 1998?</Label>
                <RadioGroup value={kyMilitaryRetiredBefore1998} onValueChange={setKyMilitaryRetiredBefore1998}>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="yes" id="ky-military-retired-before-1998-yes" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="ky-military-retired-before-1998-yes" className="font-medium">
                        Yes
                      </Label>
                      <p className="text-sm text-muted-foreground">I was retired from the military before 1998</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="no" id="ky-military-retired-before-1998-no" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="ky-military-retired-before-1998-no" className="font-medium">
                        No
                      </Label>
                      <p className="text-sm text-muted-foreground">I was not retired from the military before 1998</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {kyMilitaryRetiredBefore1998 === "yes" && (
                <div className="space-y-2">
                  <Label>
                    What percentage of your military retirement pay was earned before 1998?
                    <span className="ml-1 text-xs text-muted-foreground">(e.g., 50%)</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ky-military-pre-1998-percent"
                      className="pl-9"
                      placeholder="50"
                      value={kyTeacherPoliceFirePre1998Percent}
                      onChange={e => setKyTeacherPoliceFirePre1998Percent(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you are retired from the military before 1998, you may be eligible for a tax exemption on a portion of your military retirement pay. This percentage is used to calculate the taxable amount.
                  </p>
                </div>
              )}

              {/* Kentucky-specific: Teacher/police/firefighter pre-1998 service */}
              {(teacherPension || policePension || firefighterPension) && (
                <div className="space-y-2">
                  <Label>
                    What percentage of your teacher, police, or firefighter pension service was earned before 1998?
                    <span className="ml-1 text-xs text-muted-foreground">(e.g., 25%)</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ky-teacher-police-fire-pre-1998-percent"
                      className="pl-9"
                      placeholder="25"
                      value={kyTeacherPoliceFirePre1998Percent}
                      onChange={e => setKyTeacherPoliceFirePre1998Percent(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In Kentucky, teacher, police, and firefighter pension service earned before 1998 is fully exempt from state income tax. Service after 1998 is subject to the $31,110 exclusion.
                  </p>
                </div>
              )}
            </>
          )}

          {residenceState === "NC" && (
            <div className="space-y-2">
              <Label>Bailey Exemption (NC only): For NC state/local plans, you had 5+ years of service by Aug 12, 1989</Label>
              <RadioGroup value={ncBaileyExemption} onValueChange={setNcBaileyExemption}>
                <div className="flex items-start space-x-3 rounded-md border p-3">
                  <RadioGroupItem value="yes" id="nc-bailey-yes" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="nc-bailey-yes" className="font-medium">Yes</Label>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-md border p-3">
                  <RadioGroupItem value="no" id="nc-bailey-no" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="nc-bailey-no" className="font-medium">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Alimony Section */}
          <div className="space-y-2">
            <Label htmlFor="alimonyStatus">Do you pay or receive alimony?</Label>
            <RadioGroup value={alimonyStatus} onValueChange={setAlimonyStatus}>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="no" id="alimony-no" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="alimony-no" className="font-medium">
                    No
                  </Label>
                  <p className="text-sm text-muted-foreground">I do not pay or receive alimony</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="yes" id="alimony-yes" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="alimony-yes" className="font-medium">
                    Yes
                  </Label>
                  <p className="text-sm text-muted-foreground">I pay or receive alimony</p>
                </div>
              </div>
            </RadioGroup>
            {alimonyStatus === "yes" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-2">
                <p className="text-yellow-800 text-sm">
                  💡 <strong>Complex Tax Situation:</strong> Consider upgrading to a call with a CPA to discuss a more complex tax situation involving alimony payments.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This helps us understand if you have alimony-related tax considerations.
            </p>
          </div>

          {/* Remove the duplicate fields at the bottom and keep all the existing sections */}

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
