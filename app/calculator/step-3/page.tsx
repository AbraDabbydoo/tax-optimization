"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface VehicleInput {
  value: string
}

export default function AssetsPage() {
  // Add error state
  const [loadError, setLoadError] = useState<string | null>(null)
  const [housingStatus, setHousingStatus] = useState("")
  const [homeValue, setHomeValue] = useState("")
  const [propertyTax, setPropertyTax] = useState("")
  const [currentRent, setCurrentRent] = useState("")
  const [futurePlans, setFuturePlans] = useState("")
  const [housingBudget, setHousingBudget] = useState("")
  const [regionPreference, setRegionPreference] = useState("")
  const [vehicleCount, setVehicleCount] = useState("")
  const [vehicleInputs, setVehicleInputs] = useState<VehicleInput[]>([])
  const [vehicleValue, setVehicleValue] = useState("")
  const [movePlan, setMovePlan] = useState(""); // buy, rent, undecided
  const [nextHomeValue, setNextHomeValue] = useState("");
  const [nextHomeValueError, setNextHomeValueError] = useState("");
  const [propertyTaxError, setPropertyTaxError] = useState("");

  // Show/hide fields based on housing status
  const isRenting = housingStatus === "renting"
  const isOwning = housingStatus === "owning"

  // Load saved form data when component mounts
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("taxCalculator_assetsInfo")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setHousingStatus(parsedData.housingStatus || "")
        setHomeValue(parsedData.homeValue || "")
        setPropertyTax(parsedData.propertyTax || "")
        setCurrentRent(parsedData.currentRent || "")
        setFuturePlans(parsedData.futurePlans || "")
        setHousingBudget(parsedData.housingBudget || "")
        setRegionPreference(parsedData.regionPreference || "")
        setVehicleCount(parsedData.vehicleCount || "")
        setVehicleValue(parsedData.vehicleValue || "")
        setMovePlan(parsedData.movePlan || "");
        setNextHomeValue(parsedData.nextHomeValue || "");

        // Load vehicle inputs if available
        if (parsedData.vehicleInputs && Array.isArray(parsedData.vehicleInputs)) {
          setVehicleInputs(parsedData.vehicleInputs)
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      setLoadError("Failed to load saved data. Starting with empty form.")
    }
  }, [])

  // Update vehicle inputs when vehicle count changes
  useEffect(() => {
    const count = Number.parseInt(vehicleCount) || 0

    // If we have more vehicles than inputs, add empty inputs
    if (count > vehicleInputs.length) {
      const newInputs = [...vehicleInputs]
      for (let i = vehicleInputs.length; i < count; i++) {
        newInputs.push({ value: "" })
      }
      setVehicleInputs(newInputs)
    }
    // If we have fewer vehicles than inputs, trim the inputs
    else if (count < vehicleInputs.length) {
      setVehicleInputs(vehicleInputs.slice(0, count))
    }
  }, [vehicleCount, vehicleInputs])

  // Calculate total vehicle value when inputs change
  useEffect(() => {
    const total = vehicleInputs.reduce((sum, input) => {
      const value = Number.parseFloat(input.value.replace(/,/g, "")) || 0
      return sum + value
    }, 0)

    setVehicleValue(total.toString())
  }, [vehicleInputs])

  // Save form data when values change
  useEffect(() => {
    const formData = {
      housingStatus,
      homeValue,
      propertyTax,
      currentRent,
      futurePlans,
      housingBudget,
      regionPreference,
      vehicleCount,
      vehicleValue,
      vehicleInputs,
      movePlan,
      nextHomeValue,
    }
    localStorage.setItem("taxCalculator_assetsInfo", JSON.stringify(formData))
  }, [
    housingStatus,
    homeValue,
    propertyTax,
    currentRent,
    futurePlans,
    housingBudget,
    regionPreference,
    vehicleCount,
    vehicleValue,
    vehicleInputs,
    movePlan,
    nextHomeValue,
  ])

  // Reset values when housing status changes
  useEffect(() => {
    if (isRenting) {
      setHomeValue("")
      setPropertyTax("")
    } else if (isOwning) {
      setCurrentRent("")
    }
  }, [housingStatus, isRenting, isOwning])

  // Handle vehicle input change
  const handleVehicleInputChange = (index: number, value: string) => {
    const newInputs = [...vehicleInputs]
    newInputs[index] = { value }
    setVehicleInputs(newInputs)
  }

  // Update navigation after this page to go to step 4 (expenses)
  const handleNextStep = () => {
    // In a real app, you would validate and save the form data
    if (housingStatus === "owning" && !propertyTax) {
      setPropertyTaxError("Please enter your current property taxes per year.");
      return;
    }
    setPropertyTaxError("");
    if ((movePlan === "buy" || movePlan === "undecided") && !nextHomeValue) {
      setNextHomeValueError("Please enter an estimated purchase price.");
      return;
    }
    setNextHomeValueError("");
    window.location.href = "/calculator/step-4" // route to expenses page next
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
        <p className="text-muted-foreground">Tell us about your housing situation and future plans.</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  i === 3 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {i}
              </div>
              <span className="mt-2 text-xs font-medium">
                {i === 1 ? "Basic Info" : i === 2 ? "Income" : i === 3 ? "Assets" : i === 4 ? "Expenses" : "Credits & Deductions"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "40%" }}></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Housing & Assets</CardTitle>
          <CardDescription>Tell us about your current housing situation and future plans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Current Housing Situation</Label>
            <RadioGroup value={housingStatus} onValueChange={setHousingStatus}>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="owning" id="housing-owning" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="housing-owning" className="font-medium">
                    I own my home
                  </Label>
                  <p className="text-sm text-muted-foreground">You currently own the property where you live</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="renting" id="housing-renting" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="housing-renting" className="font-medium">
                    I rent my home
                  </Label>
                  <p className="text-sm text-muted-foreground">You currently rent the property where you live</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {isOwning && (
            <>
              <div className="space-y-2">
                <Label htmlFor="homeValue">Current Home Value</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="homeValue"
                    className="pl-9"
                    placeholder="500,000"
                    value={homeValue ? Number(homeValue.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setHomeValue(raw);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyTax">If you own a home, what are your current property taxes per year?</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="propertyTax"
                    className="pl-9"
                    placeholder="5,000"
                    value={propertyTax ? Number(propertyTax.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setPropertyTax(raw);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This helps us compare property tax burdens across different states.
                </p>
                {propertyTaxError && <p className="text-sm text-red-500">{propertyTaxError}</p>}
              </div>
            </>
          )}

          {isRenting && (
            <div className="space-y-2">
              <Label htmlFor="currentRent">Current Monthly Rent</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentRent"
                  className="pl-9"
                  placeholder="2,000"
                  value={currentRent ? Number(currentRent.replace(/,/g, "")).toLocaleString() : ""}
                  onChange={e => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(raw)) setCurrentRent(raw);
                  }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Do you know where you want to live?</Label>
            <RadioGroup value={regionPreference} onValueChange={setRegionPreference} className="space-y-3">
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="west-coast" id="region-west-coast" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="region-west-coast" className="font-medium">
                    West Coast
                  </Label>
                  <p className="text-sm text-muted-foreground">California, Oregon, Washington, Hawaii, Alaska</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="east-coast" id="region-east-coast" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="region-east-coast" className="font-medium">
                    East Coast
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Maine to Florida, including New York, Massachusetts, etc.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="midwest" id="region-midwest" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="region-midwest" className="font-medium">
                    Midwest
                  </Label>
                  <p className="text-sm text-muted-foreground">Ohio, Michigan, Illinois, Wisconsin, Minnesota, etc.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="south" id="region-south" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="region-south" className="font-medium">
                    South
                  </Label>
                  <p className="text-sm text-muted-foreground">Texas, Florida, Georgia, Tennessee, etc.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="indifferent" id="region-indifferent" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="region-indifferent" className="font-medium">
                    Indifferent
                  </Label>
                  <p className="text-sm text-muted-foreground">I'm open to any region with the best tax advantages</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>If you move to a new state, do you plan to:</Label>
            <RadioGroup value={movePlan} onValueChange={setMovePlan} className="space-y-3">
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="buy" id="move-buy" className="mt-1" />
                <div>
                  <Label htmlFor="move-buy" className="font-medium">Buy a property</Label>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="rent" id="move-rent" className="mt-1" />
                <div>
                  <Label htmlFor="move-rent" className="font-medium">Rent</Label>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="undecided" id="move-undecided" className="mt-1" />
                <div>
                  <Label htmlFor="move-undecided" className="font-medium">Undecided</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          {(movePlan === "buy" || movePlan === "undecided") && (
            <div className="space-y-2">
              <Label htmlFor="nextHomeValue">Please estimate the purchase price of your next property.</Label>
              <Input
                id="nextHomeValue"
                type="number"
                min="10000"
                placeholder="e.g. 350000"
                value={nextHomeValue}
                onChange={e => setNextHomeValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We will use this to compare property taxes across states.
              </p>
              {nextHomeValueError && <p className="text-sm text-red-500">{nextHomeValueError}</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleCount">How many vehicles do you own?</Label>
              <Input
                id="vehicleCount"
                type="number"
                min="0"
                max="6"
                placeholder="2"
                value={vehicleCount}
                onChange={(e) => {
                  const count = Math.min(Number.parseInt(e.target.value) || 0, 6)
                  setVehicleCount(count.toString())
                }}
              />
            </div>

            {Number.parseInt(vehicleCount) > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vehicle Values</Label>
                  <p className="text-sm text-muted-foreground">
                    Please enter the value of each vehicle you own. This includes cars, trucks, motorcycles, and
                    campers.
                  </p>
                  <div className="mt-2 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Some states like Virginia offer tax relief on the first $20,000 of each
                      vehicle's value. Our calculator accounts for these state-specific rules.
                    </p>
                  </div>
                </div>

                {vehicleInputs.map((input, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`vehicle-${index + 1}`}>Vehicle {index + 1}</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`vehicle-${index + 1}`}
                        name={`vehicle-${index + 1}`}
                        className="pl-9"
                        placeholder="15,000"
                        value={input.value ? Number(input.value.replace(/,/g, "")).toLocaleString() : ""}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) handleVehicleInputChange(index, raw);
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <Label>Total Vehicle Value:</Label>
                    <span className="font-semibold">
                      $
                      {Number.parseFloat(vehicleValue).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="housingBudget">What is your monthly housing budget in a new state if renting?</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="housingBudget"
                className="pl-9"
                placeholder="2,500"
                value={housingBudget ? Number(housingBudget.replace(/,/g, "")).toLocaleString() : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setHousingBudget(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This helps us factor in cost of living differences between states.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/calculator/step-2">
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
