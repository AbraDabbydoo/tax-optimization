"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreditsDeductionsPage() {
  const [selfEmploymentExpenses, setSelfEmploymentExpenses] = useState("");
  const [k401Contributions, setK401Contributions] = useState("");
  const [hsaContributions, setHsaContributions] = useState("");
  const [iraContributions, setIraContributions] = useState("");
  const [educatorExpenses, setEducatorExpenses] = useState("");
  const [militaryMovingExpenses, setMilitaryMovingExpenses] = useState("");
  const [error, setError] = useState("");
  const [isSelfEmployed, setIsSelfEmployed] = useState(false);
  const [selfEmployedHealthInsurance, setSelfEmployedHealthInsurance] = useState("");

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
        setEducatorExpenses(parsed.educatorExpenses || "");
        setMilitaryMovingExpenses(parsed.militaryMovingExpenses || "");
        setIsSelfEmployed(parsed.isSelfEmployed || false);
        setSelfEmployedHealthInsurance(parsed.selfEmployedHealthInsurance || "");
      }
    } catch (e) {}
  }, []);

  // Save data
  useEffect(() => {
    try {
      localStorage.setItem(
        "taxCalculator_creditsDeductions",
        JSON.stringify({
          selfEmploymentExpenses,
          k401Contributions,
          hsaContributions,
          iraContributions,
          educatorExpenses,
          militaryMovingExpenses,
          isSelfEmployed,
          selfEmployedHealthInsurance,
        })
      );
    } catch (e) {}
  }, [selfEmploymentExpenses, k401Contributions, hsaContributions, iraContributions, educatorExpenses, militaryMovingExpenses, isSelfEmployed, selfEmployedHealthInsurance]);

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
            <Label htmlFor="educatorExpenses">Educator Expenses</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="educatorExpenses"
                className="pl-9"
                placeholder="0"
                value={educatorExpenses ? Number(educatorExpenses.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setEducatorExpenses(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Qualified expenses paid by eligible educators for classroom materials (max $300).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="militaryMovingExpenses">Military Moving Expenses</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="militaryMovingExpenses"
                className="pl-9"
                placeholder="0"
                value={militaryMovingExpenses ? Number(militaryMovingExpenses.replace(/,/g, "")).toLocaleString() : ""}
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(raw)) setMilitaryMovingExpenses(raw);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Moving expenses for active duty military members required to relocate due to military orders.
            </p>
          </div>

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

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="isSelfEmployed"
                checked={isSelfEmployed}
                onCheckedChange={setIsSelfEmployed}
              />
              <Label htmlFor="isSelfEmployed">I was self-employed during this tax year</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              By selecting this, you attest that you were self-employed and are eligible for the self-employment tax deduction.
            </p>
            {isSelfEmployed && (
              <Alert>
                <AlertDescription>
                  Your self-employment tax deduction will be automatically calculated as 50% of your self-employment tax 
                  (15.3% of your net self-employment income).
                </AlertDescription>
              </Alert>
            )}
          </div>

          {isSelfEmployed && (
            <div className="space-y-2">
              <Label htmlFor="selfEmployedHealthInsurance">Self-Employed Health Insurance Premiums</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="selfEmployedHealthInsurance"
                  className="pl-9"
                  placeholder="0"
                  value={selfEmployedHealthInsurance ? Number(selfEmployedHealthInsurance.replace(/,/g, "")).toLocaleString() : ""}
                  onChange={e => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(raw)) setSelfEmployedHealthInsurance(raw);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter total premiums paid for medical, dental, qualified long-term care insurance, and marketplace plans for you, 
                your spouse, and dependents. Cannot exceed your net self-employment income.
              </p>
              <Alert>
                <AlertDescription>
                  Eligible if: 
                  • You have net earnings from self-employment
                  • Your business shows a net profit
                  • You were not eligible for employer-subsidized health plans
                </AlertDescription>
              </Alert>
            </div>
          )}
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