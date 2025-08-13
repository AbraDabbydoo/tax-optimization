"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreditsDeductionsPage() {
  const [selfEmploymentExpenses, setSelfEmploymentExpenses] = useState("");
  const [k401Contributions, setK401Contributions] = useState("");
  const [hsaContributions, setHsaContributions] = useState("");
  const [iraContributions, setIraContributions] = useState("");
  const [error, setError] = useState("");

  // Load saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("taxCalculator_creditsDeductions");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelfEmploymentExpenses(parsed.selfEmploymentExpenses || "");
        setK401Contributions(parsed.k401Contributions || "");
        setHsaContributions(parsed.hsaContributions || "");
        setIraContributions(parsed.iraContributions || "");
      }
    } catch (e) {}
  }, []);

  // Save data
  useEffect(() => {
    try {
      localStorage.setItem(
        "taxCalculator_creditsDeductions",
        JSON.stringify({ selfEmploymentExpenses, k401Contributions, hsaContributions, iraContributions })
      );
    } catch (e) {}
  }, [selfEmploymentExpenses, k401Contributions, hsaContributions, iraContributions]);

  const handleContinue = () => {
    setError("");
    window.location.href = "/calculator/results";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center">
        <Link href="/calculator/step-4" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
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
                  i === 5 ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-500"
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
          <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "80%" }}></div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Credits & Deductions</CardTitle>
          <CardDescription>Enter any credits or deductions you want to claim.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="selfEmploymentExpenses">Self-Employment Expenses</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="selfEmploymentExpenses"
                className="pl-9"
                placeholder="0"
                value={selfEmploymentExpenses ? Number(selfEmploymentExpenses.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setSelfEmploymentExpenses(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual self-employment expenses to deduct from self-employment income.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="k401Contributions">401k Contributions</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="k401Contributions"
                className="pl-9"
                placeholder="0"
                value={k401Contributions ? Number(k401Contributions.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setK401Contributions(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual contributions to a 401k plan.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hsaContributions">HSA Contributions</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="hsaContributions"
                className="pl-9"
                placeholder="0"
                value={hsaContributions ? Number(hsaContributions.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setHsaContributions(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual contributions to a Health Savings Account.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iraContributions">IRA Contributions</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="iraContributions"
                className="pl-9"
                placeholder="0"
                value={iraContributions ? Number(iraContributions.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setIraContributions(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Annual contributions to an Individual Retirement Account.</p>
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