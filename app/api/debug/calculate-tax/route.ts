import { type NextRequest, NextResponse } from "next/server"
import { calculateStateTaxBurden } from "@/lib/tax-calculator-debug"
import type { UserTaxInputs } from "@/lib/tax-calculator-debug"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Parse form data into the format expected by the tax calculator
    const userInputs: UserTaxInputs = {
      residenceState: (formData.get("residenceState") as string) || "",
      employmentState: (formData.get("employmentState") as string) || "",
      filingStatus: (formData.get("filingStatus") as string) || "single",
      preferredLifestyle: (formData.get("preferredLifestyle") as string) || "",
      regionPreference: (formData.get("regionPreference") as string) || "",
      dependents: (formData.get("dependents") as string) || "0",
      age: Number(formData.get("age")) || 65,
      spouseAge: Number(formData.get("spouseAge")) || 65,
      annualIncome: Number(formData.get("annualIncome")) || 0,
      retirementIncome: Number(formData.get("retirementIncome")) || 0,
      socialSecurityIncome: Number(formData.get("socialSecurityIncome")) || 0,
      privatePensionIncome: Number(formData.get("privatePensionIncome")) || 0,
      teacherPension: Number(formData.get("teacherPension")) || 0,
      policePension: Number(formData.get("policePension")) || 0,
      firefighterPension: Number(formData.get("firefighterPension")) || 0,
      militaryRetirementPay: Number(formData.get("militaryRetirementPay")) || 0,
      otherGovernmentPension: Number(formData.get("otherGovernmentPension")) || 0,
      iraDistributions: Number(formData.get("iraDistributions")) || 0,
      k401Distributions: Number(formData.get("k401Distributions")) || 0,
      investmentIncome: Number(formData.get("investmentIncome")) || 0,
      interestIncome: Number(formData.get("interestIncome")) || 0,
      dividendsIncome: Number(formData.get("dividendsIncome")) || 0,
      rentalIncome: Number(formData.get("rentalIncome")) || 0,
      royaltyIncome: Number(formData.get("royaltyIncome")) || 0,
      trustIncome: Number(formData.get("trustIncome")) || 0,
      homeValue: Number(formData.get("homeValue")) || 0,
      propertyTax: Number(formData.get("propertyTax")) || 0,
      monthlyRent: Number(formData.get("currentRent")) || 0,
      futurePlans: (formData.get("futurePlans") as string) || "",
      housingBudget: Number(formData.get("housingBudget")) || 0,
      hasDependents: (formData.get("hasDependents") as string) === "yes",
      vehicleCount: Number(formData.get("vehicleCount")) || 0,
      vehicleValue: Number(formData.get("vehicleValue")) || 0,
      // Arizona-specific fields for teacher/police/firefighter exemptions
      spouse1QualifyingJob: (formData.get("spouse1QualifyingJob") as string) === "yes",
      spouse2QualifyingJob: (formData.get("spouse2QualifyingJob") as string) === "yes",
      // Expense categories
      groceries: Number(formData.get("groceries")) || 0,
      preparedFood: Number(formData.get("preparedFood")) || 0,
      utilities: Number(formData.get("utilities")) || 0,
      services: Number(formData.get("services")) || 0,
      digitalGoods: Number(formData.get("digitalGoods")) || 0,
      medicine: Number(formData.get("medicine")) || 0,
      streamingSubscriptions: Number(formData.get("streamingSubscriptions")) || 0,
      privatePensionEmployeeContributionPortion: (formData.get("privatePensionEmployeeContributionPortion") as string) || "",
      kyMilitaryRetiredBefore1998: (formData.get("kyMilitaryRetiredBefore1998") as string) === "yes",
      kyTeacherPoliceFirePre1998Percent: Number(formData.get("kyTeacherPoliceFirePre1998Percent")) || 0,
      ncBaileyExemption: (formData.get("ncBaileyExemption") as string) === "yes",
    }

    console.log("propertyTax received in API:", formData.get("propertyTax"));

    // Calculate tax burden for the specified state
    const result = await calculateStateTaxBurden(userInputs.residenceState, userInputs)

    // Return the result
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error calculating tax:", error)
    return NextResponse.json({ error: "Failed to calculate tax" }, { status: 500 })
  }
}
