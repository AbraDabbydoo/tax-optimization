import {
  stateTaxDataPromise,
  type StateTaxData,
  type StateTaxBracket,
  type FilingStatusBrackets,
} from "./state-tax-data"

export interface VehicleData {
  value: number
}

export interface UserTaxInputs {
  residenceState: string
  employmentState: string
  filingStatus: string
  preferredLifestyle: string
  regionPreference: string
  dependents: string // Add dependents field
  annualIncome: number
  retirementIncome: number
  socialSecurityIncome: number
  pensionIncome: number
  iraDistributions: number
  investmentIncome: number
  rentalIncome: number
  royaltyIncome: number
  trustIncome: number
  homeValue: number
  currentPropertyTax: number
  monthlyRent: number
  futurePlans: string
  housingBudget: number
  hasDependents: boolean
  vehicleCount: number
  vehicleValue: number
  vehicles?: VehicleData[] // New field for individual vehicle data
}

export interface TaxCalculationResult {
  stateCode: string
  stateName: string
  totalTaxBurden: number
  incomeTaxBurden: number
  retirementTaxBurden: number
  propertyTaxBurden: number
  salesTaxBurden: number
  vehicleTaxBurden: number
  estimatedAnnualSavings: number
  costOfLivingIndex: number
  lifestyleMatch: boolean // Whether the state matches the preferred lifestyle
  regionMatch: boolean // Whether the state matches the preferred region
}

// Define regions for states
const stateRegions: Record<string, string> = {
  // West Coast
  CA: "west-coast",
  OR: "west-coast",
  WA: "west-coast",
  HI: "west-coast",
  AK: "west-coast",

  // East Coast
  ME: "east-coast",
  NH: "east-coast",
  VT: "east-coast",
  MA: "east-coast",
  RI: "east-coast",
  CT: "east-coast",
  NY: "east-coast",
  NJ: "east-coast",
  DE: "east-coast",
  MD: "east-coast",
  VA: "east-coast",
  NC: "east-coast",
  SC: "east-coast",
  GA: "east-coast",
  FL: "east-coast",

  // Midwest
  OH: "midwest",
  MI: "midwest",
  IN: "midwest",
  IL: "midwest",
  WI: "midwest",
  MN: "midwest",
  IA: "midwest",
  MO: "midwest",
  ND: "midwest",
  SD: "midwest",
  NE: "midwest",
  KS: "midwest",

  // South
  TX: "south",
  OK: "south",
  AR: "south",
  LA: "south",
  MS: "south",
  AL: "south",
  TN: "south",
  KY: "south",
  WV: "south",

  // Mountain/West (not explicitly asked for but included for completeness)
  MT: "west",
  ID: "west",
  WY: "west",
  CO: "west",
  NM: "west",
  AZ: "west",
  UT: "west",
  NV: "west",
}

// Helper function to get the appropriate tax brackets based on filing status
function getBracketsByFilingStatus(
  brackets: FilingStatusBrackets | StateTaxBracket[],
  filingStatus: string,
): StateTaxBracket[] {
  // If brackets is an array, it means there's only one set of brackets for all filing statuses
  if (Array.isArray(brackets)) {
    return brackets
  }

  // Otherwise, get the brackets for the specified filing status
  // Default to single if the filing status doesn't exist
  const validFilingStatus = filingStatus as keyof FilingStatusBrackets
  return brackets[validFilingStatus] || brackets.single
}

// Calculate income tax based on brackets
function calculateIncomeTax(
  income: number,
  brackets: FilingStatusBrackets | StateTaxBracket[],
  filingStatus: string,
  dependents = 0, // Add dependents parameter with default value
): number {
  // Get the appropriate brackets based on filing status
  const applicableBrackets = getBracketsByFilingStatus(brackets, filingStatus)

  if (applicableBrackets.length === 0) return 0

  // The rest of the function remains the same for now
  // In a full implementation, you would apply dependent-related deductions here

  let tax = 0
  let remainingIncome = income

  for (let i = 0; i < applicableBrackets.length; i++) {
    const bracket = applicableBrackets[i]
    const nextBracketMin = applicableBrackets[i + 1]?.min || Number.POSITIVE_INFINITY

    const taxableInThisBracket =
      bracket.max === null ? remainingIncome : Math.min(remainingIncome, bracket.max - bracket.min)

    if (taxableInThisBracket <= 0) break

    tax += taxableInThisBracket * (bracket.rate / 100)
    remainingIncome -= taxableInThisBracket

    if (remainingIncome <= 0) break
  }

  return tax
}

// Calculate retirement income tax
function calculateRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  pensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age = 65, // Default to 65 if not provided
): number {
  let taxableRetirementIncome = 0

  // Add Social Security income if taxed
  if (stateData.retirementIncome.socialSecurityTaxed) {
    taxableRetirementIncome += socialSecurityIncome
  }

  // Add pension income if taxed
  if (stateData.retirementIncome.pensionsTaxed) {
    taxableRetirementIncome += pensionIncome
  }

  // Add IRA distributions if taxed
  if (stateData.retirementIncome.iraDistributionsTaxed) {
    taxableRetirementIncome += iraDistributions
  }

  // Apply retirement income exemption if available and age requirement is met
  if (
    stateData.retirementIncome.retirementIncomeExemption &&
    (!stateData.retirementIncome.retirementIncomeExemptionAgeRequirement ||
      age >= stateData.retirementIncome.retirementIncomeExemptionAgeRequirement)
  ) {
    taxableRetirementIncome = Math.max(
      0,
      taxableRetirementIncome - (stateData.retirementIncome.retirementIncomeExemption || 0),
    )
  }

  // Calculate tax on the taxable retirement income using the state's income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus)
}

// Estimate property tax based on home value
function estimatePropertyTax(stateData: StateTaxData, homeValue: number): number {
  return homeValue * (stateData.propertyTax.averageEffectiveRate / 100)
}

// Estimate sales tax based on income (simplified)
function estimateSalesTax(stateData: StateTaxData, income: number): number {
  // Rough estimate: Assume 30% of income is spent on taxable items
  const estimatedTaxableSpending = income * 0.3
  const combinedRate = stateData.salesTax.stateRate + stateData.salesTax.averageLocalRate
  return estimatedTaxableSpending * (combinedRate / 100)
}

// New function to calculate vehicle tax based on state-specific rules
function calculateVehicleTax(stateData: StateTaxData, userInputs: UserTaxInputs): number {
  // If no vehicle tax rules are defined for the state, use the simplified calculation
  if (!stateData.vehicleTax) {
    return userInputs.vehicleValue * (stateData.propertyTax.averageEffectiveRate / 200)
  }

  // If the state has no vehicle tax
  if (stateData.vehicleTax.rate === 0) {
    return 0
  }

  let totalVehicleTax = 0

  // If we have individual vehicle data, use it for more accurate calculation
  if (userInputs.vehicles && userInputs.vehicles.length > 0) {
    totalVehicleTax = userInputs.vehicles.reduce((sum, vehicle) => {
      // Apply exemption if available
      const exemption = stateData.vehicleTax?.exemptionPerVehicle || 0
      const taxableValue = Math.max(0, vehicle.value - exemption)

      // Calculate tax based on the rate (per $100 of value)
      return sum + (taxableValue * (stateData.vehicleTax?.rate || 0)) / 100
    }, 0)
  } else if (userInputs.vehicleCount > 0 && userInputs.vehicleValue > 0) {
    // If we only have total value, estimate based on average value per vehicle
    const averageVehicleValue = userInputs.vehicleValue / userInputs.vehicleCount

    // Apply exemption to each vehicle
    const exemption = stateData.vehicleTax?.exemptionPerVehicle || 0
    const taxableValuePerVehicle = Math.max(0, averageVehicleValue - exemption)

    // Calculate total tax
    totalVehicleTax = (taxableValuePerVehicle * userInputs.vehicleCount * (stateData.vehicleTax?.rate || 0)) / 100
  }

  return totalVehicleTax
}

// Check if state matches preferred lifestyle
function checkLifestyleMatch(stateData: StateTaxData, preferredLifestyle: string): boolean {
  if (!preferredLifestyle || preferredLifestyle === "indifferent") {
    return true // If indifferent, all states match
  }

  // Check if the state has the preferred lifestyle tag
  return stateData.lifestyleTags.includes(preferredLifestyle)
}

// Check if state matches preferred region
function checkRegionMatch(stateCode: string, regionPreference: string): boolean {
  if (!regionPreference || regionPreference === "indifferent") {
    return true // If indifferent, all regions match
  }

  return stateRegions[stateCode] === regionPreference
}

// Main function to calculate tax burden for a specific state
export async function calculateStateTaxBurden(
  stateCode: string,
  userInputs: UserTaxInputs,
): Promise<TaxCalculationResult> {
  // Ensure state tax data is loaded
  const taxData = await stateTaxDataPromise
  const stateData = taxData[stateCode]

  if (!stateData) {
    throw new Error(`No tax data available for state code: ${stateCode}`)
  }

  // Get number of dependents (convert from string to number)
  const numDependents = Number.parseInt(userInputs.dependents) || 0

  // Calculate income tax
  const incomeTaxBurden = calculateIncomeTax(
    userInputs.annualIncome +
      userInputs.investmentIncome +
      userInputs.rentalIncome +
      userInputs.royaltyIncome +
      userInputs.trustIncome,
    stateData.incomeTax.brackets,
    userInputs.filingStatus,
    numDependents, // Pass dependents to income tax calculation
  )

  // Calculate retirement income tax
  const retirementTaxBurden = calculateRetirementTax(
    stateData,
    userInputs.socialSecurityIncome,
    userInputs.pensionIncome,
    userInputs.iraDistributions,
    userInputs.filingStatus,
  )

  // Calculate property tax
  let propertyTaxBurden = 0
  if (userInputs.futurePlans === "buy") {
    // If planning to buy, estimate based on housing budget (converted to home value)
    // Rough estimate: Annual housing budget * 12 * 15 (assuming 15-year mortgage)
    const estimatedHomeValue = userInputs.housingBudget * 12 * 15
    propertyTaxBurden = estimatePropertyTax(stateData, estimatedHomeValue)
  } else if (userInputs.homeValue > 0) {
    // If currently a homeowner, use similar home value for comparison
    propertyTaxBurden = estimatePropertyTax(stateData, userInputs.homeValue)
  }

  // Calculate sales tax
  const salesTaxBurden = estimateSalesTax(stateData, userInputs.annualIncome + userInputs.retirementIncome)

  // Calculate vehicle-related taxes using the new function
  const vehicleTaxBurden = calculateVehicleTax(stateData, userInputs)

  // Calculate total tax burden
  const totalTaxBurden = incomeTaxBurden + retirementTaxBurden + propertyTaxBurden + salesTaxBurden + vehicleTaxBurden

  // Check lifestyle match
  const lifestyleMatch = checkLifestyleMatch(stateData, userInputs.preferredLifestyle)

  // Check region match
  const regionMatch = checkRegionMatch(stateCode, userInputs.regionPreference)

  // For the current residence state, savings will be 0
  // For other states, we'll calculate the difference in the getTaxOptimizationRecommendations function
  const estimatedAnnualSavings = 0

  return {
    stateCode,
    stateName: stateData.name,
    totalTaxBurden,
    incomeTaxBurden,
    retirementTaxBurden,
    propertyTaxBurden,
    salesTaxBurden,
    vehicleTaxBurden,
    estimatedAnnualSavings,
    costOfLivingIndex: stateData.costOfLivingIndex,
    lifestyleMatch,
    regionMatch,
  }
}

// Function to get tax optimization recommendations
export async function getTaxOptimizationRecommendations(
  userInputs: UserTaxInputs,
  topCount = 5,
): Promise<TaxCalculationResult[]> {
  // First, calculate the current state tax burden
  const currentStateResult = await calculateStateTaxBurden(userInputs.residenceState, userInputs)
  const currentStateTaxBurden = currentStateResult.totalTaxBurden

  // Ensure state tax data is loaded
  const taxData = await stateTaxDataPromise

  // Calculate tax burden for all states
  const allStateResultsPromises = Object.keys(taxData).map(async (stateCode) => {
    const result = await calculateStateTaxBurden(stateCode, userInputs)

    // Calculate savings compared to current state
    result.estimatedAnnualSavings = currentStateTaxBurden - result.totalTaxBurden

    return result
  })

  // Wait for all calculations to complete
  const allStateResults = await Promise.all(allStateResultsPromises)

  // Apply filters based on user preferences
  let filteredResults = allStateResults

  // Filter by lifestyle preference if specified
  if (userInputs.preferredLifestyle && userInputs.preferredLifestyle !== "indifferent") {
    const lifestyleFiltered = filteredResults.filter((result) => result.lifestyleMatch)

    // Only apply the filter if we have matching states
    if (lifestyleFiltered.length > 0) {
      filteredResults = lifestyleFiltered
    }
  }

  // Filter by region preference if specified
  if (userInputs.regionPreference && userInputs.regionPreference !== "indifferent") {
    const regionFiltered = filteredResults.filter((result) => result.regionMatch)

    // Only apply the filter if we have matching states
    if (regionFiltered.length > 0) {
      filteredResults = regionFiltered
    }
  }

  // Sort by estimated annual savings (highest first)
  const sortedResults = filteredResults.sort((a, b) => b.estimatedAnnualSavings - a.estimatedAnnualSavings)

  // Return top states
  return sortedResults.slice(0, topCount)
}
