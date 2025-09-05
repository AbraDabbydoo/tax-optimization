"use server"

import { getTaxOptimizationRecommendations } from "@/lib/tax-calculator"
import type { UserTaxInputs } from "@/lib/tax-calculator"

export async function calculateOptimalTaxStates(formData: FormData) {
  try {
    console.log("Starting tax optimization calculation...")

    // Parse form data into the format expected by the tax calculator
    const userInputs: UserTaxInputs = {
      residenceState: (formData.get("residenceState") as string) || "",
      employmentState: (formData.get("employmentState") as string) || "",
      filingStatus: (formData.get("filingStatus") as string) || "single",
      preferredLifestyle: (formData.get("preferredLifestyle") as string) || "",
      regionPreference: (formData.get("regionPreference") as string) || "",
      dependents: (formData.get("dependents") as string) || "0",
      qualifyingChildren: (formData.get("qualifyingChildren") as string) || "0",
      age: Number(formData.get("age")) || 65,
      spouseAge: formData.get("spouseAge") ? Number(formData.get("spouseAge")) : undefined,
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
      rentalIncome: Number(formData.get("rentalIncome")) || 0,
      royaltyIncome: Number(formData.get("royaltyIncome")) || 0,
      trustIncome: Number(formData.get("trustIncome")) || 0,
      homeValue: Number(formData.get("homeValue")) || 0,
      propertyTax: Number(formData.get("propertyTax")) || 0,
      monthlyRent: Number(formData.get("currentRent")) || 0,
      futurePlans: (formData.get("futurePlans") as string) || "",
      housingBudget: Number(formData.get("housingBudget")) || 0,
      hasDependents: formData.get("hasDependents") === "yes",
      vehicleCount: Number(formData.get("vehicleCount")) || 0,
      vehicleValue: Number(formData.get("vehicleValue")) || 0,
    }

    // Add individual vehicle data if available
    const vehicles: { value: number }[] = []
    for (let i = 1; i <= userInputs.vehicleCount; i++) {
      const vehicleValue = Number(formData.get(`vehicle-${i}`)) || 0
      if (vehicleValue > 0) {
        vehicles.push({ value: vehicleValue })
      }
    }

    if (vehicles.length > 0) {
      userInputs.vehicles = vehicles
    }

    console.log("User inputs prepared:", userInputs)

    // Get tax optimization recommendations
    const recommendations = await getTaxOptimizationRecommendations(userInputs)

    console.log("Recommendations calculated:", recommendations.length)

    return { recommendations }
  } catch (error) {
    console.error("Error in calculateOptimalTaxStates:", error)
    return {
      error: "Failed to complete tax recommendations. Please try again.",
      recommendations: [],
    }
  }
}
