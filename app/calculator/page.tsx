"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const states = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
]

export default function CalculatorPage() {
  const [residenceState, setResidenceState] = useState<string>("")
  const [employmentState, setEmploymentState] = useState<string>("")
  const [filingStatus, setFilingStatus] = useState<string>("")
  const [preferredLifestyle, setPreferredLifestyle] = useState<string>("")
  const [dependents, setDependents] = useState<string>("")
  const [errors, setErrors] = useState({
    residenceState: false,
    employmentState: false,
    filingStatus: false,
  })
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load saved form data when component mounts
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("taxCalculator_basicInfo")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setResidenceState(parsedData.residenceState || "")
        setEmploymentState(parsedData.employmentState || "")
        setFilingStatus(parsedData.filingStatus || "")
        setPreferredLifestyle(parsedData.preferredLifestyle || "")
        setDependents(parsedData.dependents || "")
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
        residenceState,
        employmentState,
        filingStatus,
        preferredLifestyle,
        dependents,
      }
      localStorage.setItem("taxCalculator_basicInfo", JSON.stringify(formData))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }, [residenceState, employmentState, filingStatus, preferredLifestyle, dependents])

  const handleNextStep = () => {
    // Validate form
    const newErrors = {
      residenceState: !residenceState,
      employmentState: !employmentState,
      filingStatus: !filingStatus,
    }

    setErrors(newErrors)

    // If no errors, proceed to next step
    if (!Object.values(newErrors).some(Boolean)) {
      // Form data is already saved in localStorage via the useEffect
      window.location.href = "/calculator/step-2"
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
        <p className="text-muted-foreground">
          Let's start by understanding your current situation to prepare for your future one.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  i === 1 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {i}
              </div>
              <span className="mt-2 text-xs font-medium">
                {i === 1 ? "Basic Info" : i === 2 ? "Income" : i === 3 ? "Assets" : "Results"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "0%" }}></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell us about your current location and filing status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="residenceState">
              Current State of Residence <span className="text-red-500">*</span>
            </Label>
            <Select value={residenceState} onValueChange={setResidenceState}>
              <SelectTrigger id="residenceState" className={errors.residenceState ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your state of residence" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.residenceState && <p className="text-sm text-red-500">Please select your state of residence</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentState">
              Current State of Employment <span className="text-red-500">*</span>
            </Label>
            <Select value={employmentState} onValueChange={setEmploymentState}>
              <SelectTrigger id="employmentState" className={errors.employmentState ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your state of employment" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
                <SelectItem value="remote">I work remotely</SelectItem>
                <SelectItem value="multiple">I work in multiple states</SelectItem>
                <SelectItem value="retired">I'm retired / not employed</SelectItem>
              </SelectContent>
            </Select>
            {errors.employmentState && <p className="text-sm text-red-500">Please select your state of employment</p>}
            <p className="text-xs text-muted-foreground">
              If you are retired or not employed, please select that in the dropdown.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filingStatus">
              Filing Status <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={filingStatus} onValueChange={setFilingStatus} className="space-y-3">
              {/* Added key prop to each RadioGroupItem div */}
              <div
                key="single"
                className={`flex items-start space-x-3 rounded-md border p-3 ${errors.filingStatus ? "border-red-500" : ""}`}
              >
                <RadioGroupItem value="single" id="filing-single" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="filing-single" className="font-medium">
                    Single
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You are unmarried and don't qualify for another filing status
                  </p>
                </div>
              </div>
              <div
                key="married-joint"
                className={`flex items-start space-x-3 rounded-md border p-3 ${errors.filingStatus ? "border-red-500" : ""}`}
              >
                <RadioGroupItem value="married-joint" id="filing-married-joint" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="filing-married-joint" className="font-medium">
                    Married Filing Jointly
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You are married and both spouses agree to file a joint return
                  </p>
                </div>
              </div>
              <div
                key="married-separate"
                className={`flex items-start space-x-3 rounded-md border p-3 ${errors.filingStatus ? "border-red-500" : ""}`}
              >
                <RadioGroupItem value="married-separate" id="filing-married-separate" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="filing-married-separate" className="font-medium">
                    Married Filing Separately
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You are married but choose to file separate tax returns
                  </p>
                </div>
              </div>
              <div
                key="head-of-household"
                className={`flex items-start space-x-3 rounded-md border p-3 ${errors.filingStatus ? "border-red-500" : ""}`}
              >
                <RadioGroupItem value="head-of-household" id="filing-head-of-household" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="filing-head-of-household" className="font-medium">
                    Head of Household
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    You are unmarried and pay more than half the cost of keeping up a home for yourself and a qualifying
                    person
                  </p>
                </div>
              </div>
            </RadioGroup>
            {errors.filingStatus && <p className="text-sm text-red-500">Please select your filing status</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dependents">Number of Dependents</Label>
            <Select value={dependents} onValueChange={setDependents}>
              <SelectTrigger id="dependents">
                <SelectValue placeholder="Select number of dependents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6+</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This helps us calculate tax credits and deductions related to dependents.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredLifestyle">Preferred Lifestyle</Label>
            <RadioGroup
              value={preferredLifestyle}
              onValueChange={setPreferredLifestyle}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {/* Added key prop to each RadioGroupItem div */}
              <div key="city" className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="city" id="lifestyle-city" className="mt-1" />
                <div>
                  <Label htmlFor="lifestyle-city" className="font-medium">
                    City
                  </Label>
                </div>
              </div>
              <div key="mountain" className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="mountain" id="lifestyle-mountain" className="mt-1" />
                <div>
                  <Label htmlFor="lifestyle-mountain" className="font-medium">
                    Mountain
                  </Label>
                </div>
              </div>
              <div key="lake" className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="lake" id="lifestyle-lake" className="mt-1" />
                <div>
                  <Label htmlFor="lifestyle-lake" className="font-medium">
                    Lake
                  </Label>
                </div>
              </div>
              <div key="beach" className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="beach" id="lifestyle-beach" className="mt-1" />
                <div>
                  <Label htmlFor="lifestyle-beach" className="font-medium">
                    Beach
                  </Label>
                </div>
              </div>
              <div key="indifferent" className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="indifferent" id="lifestyle-indifferent" className="mt-1" />
                <div>
                  <Label htmlFor="lifestyle-indifferent" className="font-medium">
                    Indifferent
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              This helps us recommend states that match your preferred environment.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
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
