"use server"

import { getTaxOptimizationRecommendations, type UserTaxInputs, type VehicleData } from "@/lib/tax-calculator"

export async function calculateOptimalTaxStates(formData: FormData) {
  // Extract and parse form data
  const userInputs: UserTaxInputs = {
    residenceState: formData.get("residenceState") as string,
    employmentState: formData.get("employmentState") as string,
    filingStatus: formData.get("filingStatus") as string,
    preferredLifestyle: formData.get("preferredLifestyle") as string,
    regionPreference: formData.get("regionPreference") as string,
    dependents: formData.get("dependents") as string, // Add dependents
    annualIncome: Number.parseFloat(formData.get("annualIncome") as string) || 0,
    retirementIncome: Number.parseFloat(formData.get("retirementIncome") as string) || 0,
    socialSecurityIncome: Number.parseFloat(formData.get("socialSecurityIncome") as string) || 0,
    pensionIncome: Number.parseFloat(formData.get("pensionIncome") as string) || 0,
    iraDistributions: Number.parseFloat(formData.get("iraDistributions") as string) || 0,
    investmentIncome: Number.parseFloat(formData.get("investmentIncome") as string) || 0,
    rentalIncome: Number.parseFloat(formData.get("rentalIncome") as string) || 0,
    royaltyIncome: Number.parseFloat(formData.get("royaltyIncome") as string) || 0,
    trustIncome: Number.parseFloat(formData.get("trustIncome") as string) || 0,
    homeValue: Number.parseFloat(formData.get("homeValue") as string) || 0,
    currentPropertyTax: Number.parseFloat(formData.get("propertyTax") as string) || 0,
    monthlyRent: Number.parseFloat(formData.get("currentRent") as string) || 0,
    vehicleCount: Number.parseInt(formData.get("vehicleCount") as string) || 0,
    vehicleValue: Number.parseFloat(formData.get("vehicleValue") as string) || 0,
    futurePlans: formData.get("futurePlans") as string,
    housingBudget: Number.parseFloat(formData.get("housingBudget") as string) || 0,
    hasDependents: formData.get("hasDependents") === "yes",
  }

  // Process individual vehicle data if available
  const vehicleCount = userInputs.vehicleCount
  if (vehicleCount > 0) {
    const vehicles: VehicleData[] = []

    for (let i = 1; i <= vehicleCount; i++) {
      const vehicleValue = Number.parseFloat(formData.get(`vehicle-${i}`) as string) || 0
      if (vehicleValue > 0) {
        vehicles.push({ value: vehicleValue })
      }
    }

    if (vehicles.length > 0) {
      userInputs.vehicles = vehicles

      // If we have individual vehicle data, recalculate the total vehicle value
      userInputs.vehicleValue = vehicles.reduce((sum, vehicle) => sum + vehicle.value, 0)
    }
  }

  try {
    // Get tax optimization recommendations
    const recommendations = await getTaxOptimizationRecommendations(userInputs)

    return {
      recommendations,
      userInputs,
    }
  } catch (error) {
    console.error("Error calculating tax recommendations:", error)
    return {
      error: "Failed to calculate tax recommendations. Please try again.",
      userInputs,
    }
  }
}
