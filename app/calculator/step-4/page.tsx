"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExpensesPage() {
  const [groceries, setGroceries] = useState("")
  const [preparedFood, setPreparedFood] = useState("")
  const [utilities, setUtilities] = useState("")
  const [services, setServices] = useState("")
  const [digitalGoods, setDigitalGoods] = useState("")
  const [medicine, setMedicine] = useState("")
  const [streamingSubscriptions, setStreamingSubscriptions] = useState("")
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load saved form data when component mounts
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("taxCalculator_expensesInfo")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setGroceries(parsedData.groceries || "")
        setPreparedFood(parsedData.preparedFood || "")
        setUtilities(parsedData.utilities || "")
        setServices(parsedData.services || "")
        setDigitalGoods(parsedData.digitalGoods || "")
        setMedicine(parsedData.medicine || "")
        setStreamingSubscriptions(parsedData.streamingSubscriptions || "")
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
        groceries,
        preparedFood,
        utilities,
        services,
        digitalGoods,
        medicine,
        streamingSubscriptions,
      }
      localStorage.setItem("taxCalculator_expensesInfo", JSON.stringify(formData))
    } catch (error) {
      console.error("Error saving form data:", error)
    }
  }, [groceries, preparedFood, utilities, services, digitalGoods, medicine, streamingSubscriptions])

  const handleNextStep = () => {
    // Form data is already saved in localStorage via the useEffect
    window.location.href = "/calculator/results"
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
          Tell us about your monthly expenses to help us calculate consumption taxes.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  i <= 4 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
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
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "80%" }}></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>
            Please provide your estimated monthly expenses in each category. This helps us calculate consumption taxes
            for different states.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="groceries">Groceries</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="groceries"
                  className="pl-9"
                  placeholder="500"
                  value={groceries}
                  onChange={(e) => setGroceries(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly spending on unprepared food items</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparedFood">Prepared Food & Restaurants</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="preparedFood"
                  className="pl-9"
                  placeholder="300"
                  value={preparedFood}
                  onChange={(e) => setPreparedFood(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly spending at restaurants and on prepared food</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utilities">Utilities</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="utilities"
                  className="pl-9"
                  placeholder="250"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly spending on electricity, water, gas, etc.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="services"
                  className="pl-9"
                  placeholder="200"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly spending on personal and professional services</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="digitalGoods">Digital Goods</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="digitalGoods"
                  className="pl-9"
                  placeholder="50"
                  value={digitalGoods}
                  onChange={(e) => setDigitalGoods(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly spending on digital products and downloads</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicine">Medicine</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="medicine"
                  className="pl-9"
                  placeholder="100"
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly spending on prescription and OTC medications</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamingSubscriptions">Streaming & Subscriptions</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="streamingSubscriptions"
                  className="pl-9"
                  placeholder="75"
                  value={streamingSubscriptions}
                  onChange={(e) => setStreamingSubscriptions(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly spending on streaming services and digital subscriptions
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/calculator/step-3">
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
