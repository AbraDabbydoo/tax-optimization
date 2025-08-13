"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExpensesPage() {
  const [groceries, setGroceries] = useState("");
  const [preparedFood, setPreparedFood] = useState("");
  const [utilities, setUtilities] = useState("");
  const [services, setServices] = useState("");
  const [digitalGoods, setDigitalGoods] = useState("");
  const [medicine, setMedicine] = useState("");
  const [streamingSubscriptions, setStreamingSubscriptions] = useState("");
  const [error, setError] = useState("");

  // Load saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taxCalculator_expensesInfo");
      if (saved) {
        const parsed = JSON.parse(saved);
        setGroceries(parsed.groceries || "");
        setPreparedFood(parsed.preparedFood || "");
        setUtilities(parsed.utilities || "");
        setServices(parsed.services || "");
        setDigitalGoods(parsed.digitalGoods || "");
        setMedicine(parsed.medicine || "");
        setStreamingSubscriptions(parsed.streamingSubscriptions || "");
      }
    } catch (e) {}
  }, []);

  // Save data
  useEffect(() => {
    try {
      localStorage.setItem(
        "taxCalculator_expensesInfo",
        JSON.stringify({ groceries, preparedFood, utilities, services, digitalGoods, medicine, streamingSubscriptions })
      );
    } catch (e) {}
  }, [groceries, preparedFood, utilities, services, digitalGoods, medicine, streamingSubscriptions]);

  const handleContinue = () => {
    // No required fields for now, but you could add validation here
    setError("");
    window.location.href = "/calculator/step-5";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center">
        <Link href="/calculator/step-3" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  i === 4 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
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
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "60%" }}></div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Enter your average monthly spending in each category.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="groceries">Groceries</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="groceries"
                className="pl-9"
                placeholder="0"
                value={groceries ? Number(groceries.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setGroceries(raw);
                }}
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
                placeholder="0"
                value={preparedFood ? Number(preparedFood.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setPreparedFood(raw);
                }}
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
                placeholder="0"
                value={utilities ? Number(utilities.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setUtilities(raw);
                }}
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
                placeholder="0"
                value={services ? Number(services.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setServices(raw);
                }}
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
                placeholder="0"
                value={digitalGoods ? Number(digitalGoods.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setDigitalGoods(raw);
                }}
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
                placeholder="0"
                value={medicine ? Number(medicine.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setMedicine(raw);
                }}
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
                placeholder="0"
                value={streamingSubscriptions ? Number(streamingSubscriptions.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setStreamingSubscriptions(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Monthly spending on streaming services and digital subscriptions</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleContinue}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
