"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [hasEarlyWithdrawal, setHasEarlyWithdrawal] = useState(false);
  const [earlyWithdrawalAmount, setEarlyWithdrawalAmount] = useState("");
  const [hasStudentLoan, setHasStudentLoan] = useState(false);
  const [studentLoanInterest, setStudentLoanInterest] = useState("");
  const [hasEducationCredits, setHasEducationCredits] = useState("no");
  const [educationCreditType, setEducationCreditType] = useState("");
  const [educationExpenses, setEducationExpenses] = useState("");

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
        setHasEarlyWithdrawal(parsed.hasEarlyWithdrawal || false);
        setEarlyWithdrawalAmount(parsed.earlyWithdrawalAmount || "");
        setHasStudentLoan(parsed.hasStudentLoan || false);
        setStudentLoanInterest(parsed.studentLoanInterest || "");
        setHasEducationCredits(parsed.hasEducationCredits || "no");
        setEducationCreditType(parsed.educationCreditType || "");
        setEducationExpenses(parsed.educationExpenses || "");
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
          hasEarlyWithdrawal,
          earlyWithdrawalAmount,
          hasStudentLoan,
          studentLoanInterest,
          hasEducationCredits,
          educationCreditType,
          educationExpenses,
        })
      );
    } catch (e) {}
  }, [selfEmploymentExpenses, k401Contributions, hsaContributions, iraContributions, educatorExpenses, militaryMovingExpenses, isSelfEmployed, selfEmployedHealthInsurance, hasEarlyWithdrawal, earlyWithdrawalAmount, hasStudentLoan, studentLoanInterest, hasEducationCredits, educationCreditType, educationExpenses]);

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
                id="hasEarlyWithdrawal"
                checked={hasEarlyWithdrawal}
                onCheckedChange={setHasEarlyWithdrawal}
              />
              <Label htmlFor="hasEarlyWithdrawal">I took an early withdrawal from a Traditional IRA/401(k)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Early withdrawals are generally subject to a 10% penalty if taken before age 59½, unless an exception applies.
            </p>
            {hasEarlyWithdrawal && (
              <>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="earlyWithdrawalAmount"
                    className="pl-9"
                    placeholder="0"
                    value={earlyWithdrawalAmount ? Number(earlyWithdrawalAmount.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setEarlyWithdrawalAmount(raw);
                    }}
                  />
                </div>
                <Alert>
                  <AlertDescription>
                    The withdrawn amount will be added to your Adjusted Gross Income (AGI) and may be subject to a 10% early withdrawal penalty.
                  </AlertDescription>
                </Alert>
              </>
            )}
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

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasStudentLoan"
                checked={hasStudentLoan}
                onCheckedChange={setHasStudentLoan}
              />
              <Label htmlFor="hasStudentLoan">I had qualified student loan interest during this tax year</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              You can deduct up to $2,500 of qualified student loan interest you paid during the year, which directly reduces your AGI.
            </p>
            {hasStudentLoan && (
              <>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="studentLoanInterest"
                    className="pl-9"
                    placeholder="0"
                    value={studentLoanInterest ? Number(studentLoanInterest.replace(/,/g, "")).toLocaleString() : ""}
                    onChange={e => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (/^\d*$/.test(raw)) setStudentLoanInterest(raw);
                    }}
                  />
                </div>
                <Alert>
                  <AlertDescription>
                    The deduction amount may be reduced or eliminated based on your income level. 
                    Maximum deduction is $2,500, but it phases out for higher income levels.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Did you or your dependents qualify for education tax credits during this tax year?</Label>
            <RadioGroup value={hasEducationCredits} onValueChange={setHasEducationCredits}>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="yes" id="education-yes" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="education-yes" className="font-medium">
                    Yes
                  </Label>
                  <p className="text-sm text-muted-foreground">I qualified for education tax credits</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 rounded-md border p-3">
                <RadioGroupItem value="no" id="education-no" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="education-no" className="font-medium">
                    No
                  </Label>
                  <p className="text-sm text-muted-foreground">I did not qualify for education tax credits</p>
                </div>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Education tax credits help offset the cost of higher education expenses for you or your dependents.
            </p>
            {hasEducationCredits === "yes" && (
              <>
                <div className="space-y-2 mt-4">
                  <Label>Which education credit did you qualify for?</Label>
                  <RadioGroup value={educationCreditType} onValueChange={setEducationCreditType}>
                    <div className="flex items-start space-x-3 rounded-md border p-3">
                      <RadioGroupItem value="aotc" id="credit-aotc" className="mt-1" />
                      <div className="space-y-1">
                        <Label htmlFor="credit-aotc" className="font-medium">
                          American Opportunity Tax Credit (AOTC)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          For students in the first 4 years of postsecondary education. Up to $2,500 credit, 40% refundable.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 rounded-md border p-3">
                      <RadioGroupItem value="llc" id="credit-llc" className="mt-1" />
                      <div className="space-y-1">
                        <Label htmlFor="credit-llc" className="font-medium">
                          Lifetime Learning Credit (LLC)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          For any level of education with no year limit. Up to $2,000 credit, non-refundable.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {educationCreditType && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="educationExpenses">Qualified Education Expenses</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="educationExpenses"
                        className="pl-9"
                        placeholder="0"
                        value={educationExpenses ? Number(educationExpenses.replace(/,/g, "")).toLocaleString() : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/,/g, "");
                          if (/^\d*$/.test(raw)) setEducationExpenses(raw);
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the total qualified education expenses paid during the tax year (tuition, fees, required course materials).
                    </p>
                    <Alert>
                      <AlertDescription>
                        {educationCreditType === "aotc" ? (
                          <>
                            <strong>AOTC Details:</strong> 100% of first $2,000 + 25% of next $2,000 = max $2,500 credit.
                            40% refundable (up to $1,000). Phaseout: $80k-$90k (single), $160k-$180k (MFJ).
                          </>
                        ) : (
                          <>
                            <strong>LLC Details:</strong> 20% of up to $10,000 = max $2,000 credit.
                            Non-refundable. Phaseout: $80k-$90k (single), $160k-$180k (MFJ). No year limit.
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </>
            )}
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