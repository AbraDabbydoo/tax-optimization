// This is a modified version of the tax calculator with extra logging

import { stateTaxDataPromise, type StateTaxBracket, type FilingStatusBrackets, type StateTaxData, type SalesTaxCategory } from "./state-tax-data"

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
  age: number // Add this
  spouseAge?: number // Add this
  annualIncome: number
  retirementIncome: number
  interestIncome?: number // Add this
  dividendsIncome?: number // Add this
  k401Distributions: number // Add this
  socialSecurityIncome: number
  privatePensionIncome: number
  teacherPension: number
  policePension: number
  firefighterPension: number
  militaryRetirementPay: number
  otherGovernmentPension: number
  iraDistributions: number
  investmentIncome: number
  rentalIncome: number
  royaltyIncome: number
  trustIncome: number
  homeValue: number
  propertyTax: number
  monthlyRent: number
  futurePlans: string
  housingBudget: number
  hasDependents: boolean
  vehicleCount: number
  vehicleValue: number
  vehicles?: VehicleData[] // New field for individual vehicle data
  // Arizona-specific fields for determining teacher/police/firefighter exemptions
  spouse1QualifyingJob?: boolean // Whether spouse 1 worked as teacher/police/firefighter
  spouse2QualifyingJob?: boolean // Whether spouse 2 worked as teacher/police/firefighter
  // Expense categories
  groceries?: number
  preparedFood?: number
  utilities?: number
  services?: number
  digitalGoods?: number
  medicine?: number
  streamingSubscriptions?: number
  // Additional fields that might be needed
  privatePensionEmployeeContributionPortion?: string // Add this
  kyMilitaryRetiredBefore1998?: boolean // Add this
  kyTeacherPoliceFirePre1998Percent?: number // Add this
  ncBaileyExemption?: boolean // Add this
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

// Helper function to get the appropriate tax brackets based on filing status
function getBracketsByFilingStatus(
  brackets: FilingStatusBrackets | StateTaxBracket[],
  filingStatus: string,
): StateTaxBracket[] {
  console.log("DEBUG: Getting brackets for filing status:", filingStatus)
  console.log("DEBUG: Brackets type:", Array.isArray(brackets) ? "Array" : "Object")
  console.log("DEBUG: Brackets data:", JSON.stringify(brackets))

  // If brackets is an array, it means there's only one set of brackets for all filing statuses
  if (Array.isArray(brackets)) {
    console.log("DEBUG: Brackets is an array, returning directly")
    return brackets
  }

  // Map the user's filing status to the ones in our data structure
  let dataFilingStatus = filingStatus.toLowerCase()
  if (
    dataFilingStatus === "joint" ||
    dataFilingStatus === "marriedjointly" ||
    dataFilingStatus === "married filing jointly"
  ) {
    dataFilingStatus = "married"
  } else if (dataFilingStatus === "head" || dataFilingStatus === "hoh" || dataFilingStatus === "head of household") {
    dataFilingStatus = "headOfHousehold"
  } else if (
    dataFilingStatus !== "single" &&
    dataFilingStatus !== "married" &&
    dataFilingStatus !== "headOfHousehold"
  ) {
    console.log("DEBUG: Unknown filing status, defaulting to single")
    dataFilingStatus = "single" // Default to single for unknown filing statuses
  }

  console.log("DEBUG: Mapped filing status:", dataFilingStatus)

  // Get the brackets for the specified filing status
  // Default to single if the filing status doesn't exist
  const result = brackets[dataFilingStatus as keyof FilingStatusBrackets] || brackets.single || []
  console.log(`DEBUG: Found ${result.length} brackets for ${dataFilingStatus}`)
  console.log("DEBUG: Bracket details:", JSON.stringify(result))

  return result
}

// Calculate income tax based on brackets
function calculateIncomeTax(
  income: number,
  brackets: FilingStatusBrackets | StateTaxBracket[],
  filingStatus: string,
  dependents = 0, // Add dependents parameter with default value
): number {
  console.log("DEBUG: Calculating income tax for income:", income, "filing status:", filingStatus)

  // Get the appropriate brackets based on filing status
  const applicableBrackets = getBracketsByFilingStatus(brackets, filingStatus)

  if (!applicableBrackets || applicableBrackets.length === 0) {
    console.log("DEBUG: No applicable brackets found, returning 0")
    return 0
  }

  let tax = 0

  // Sort brackets by min income to ensure proper calculation
  const sortedBrackets = [...applicableBrackets].sort((a, b) => (a.min || 0) - (b.min || 0))

  for (let i = 0; i < sortedBrackets.length; i++) {
    const bracket = sortedBrackets[i]
    const min = bracket.min || 0
    const max = bracket.max === null ? Number.POSITIVE_INFINITY : bracket.max
    const rate = bracket.rate / 100 // Convert percentage to decimal

    console.log(`DEBUG: Bracket ${i + 1}: min=${min}, max=${max}, rate=${rate}`)

    if (income <= min) {
      // Income is below this bracket
      console.log(`DEBUG: Income ${income} is below min ${min}, skipping bracket`)
      continue
    }

    const taxableInThisBracket = Math.min(income, max) - min
    console.log(`DEBUG: Taxable in bracket ${i + 1}: ${taxableInThisBracket}`)

    if (taxableInThisBracket <= 0) {
      console.log(`DEBUG: Taxable amount is <= 0, skipping bracket`)
      continue
    }

    const taxForBracket = taxableInThisBracket * rate
    console.log(`DEBUG: Tax for bracket ${i + 1}: ${taxForBracket}`)

    tax += taxForBracket

    if (income <= max) {
      // We've reached the highest applicable bracket
      console.log(`DEBUG: Income ${income} is <= max ${max}, breaking loop`)
      break
    }
  }

  console.log("DEBUG: Total calculated income tax:", tax)
  return tax
}

// Calculate retirement income tax
function calculateRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age = 65, // Default to 65 if not provided
): number {
  // Check if state has income tax
  if (!stateData.incomeTax || !stateData.incomeTax.hasIncomeTax) {
    return 0
  }

  let taxableRetirementIncome = 0

  // Add Social Security income if taxed
  if (stateData.retirementIncome?.socialSecurityTaxed) {
    taxableRetirementIncome += socialSecurityIncome
  }

  // Add pension income if taxed
  if (
    stateData.retirementIncome?.privatePensionsTaxed ||
    (stateData.retirementIncome as any)?.pensionsTaxed
  ) {
    taxableRetirementIncome += privatePensionIncome
  }

  if (stateData.retirementIncome?.publicPensionsTaxed) {
    taxableRetirementIncome += publicPensionIncome
  }

  // Add IRA/401k distributions if taxed
  if (stateData.retirementIncome?.iraDistributionsTaxed) {
    let taxableIra = iraDistributions
    // Alabama-specific: apply $12,000 exemption per person 65+ for IRA/401k
    if (
      stateData.abbreviation === "AL" &&
      stateData.retirementIncome?.iraAnd401kExemption &&
      age >= (stateData.retirementIncome.iraAnd401kExemptionAgeRequirement || 65)
    ) {
      // Determine exemption amount based on filing status
      let exemption = stateData.retirementIncome.iraAnd401kExemption
      if (filingStatus.toLowerCase().includes("married")) {
        exemption *= 2 // $24,000 for married
      }
      taxableIra = Math.max(0, taxableIra - exemption)
    }
    taxableRetirementIncome += taxableIra
  }

  // Apply any other retirement income exemption if available and age requirement is met
  if (
    stateData.retirementIncome?.retirementIncomeExemption &&
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
  return homeValue * (stateData.propertyTax?.averageEffectiveRate / 100 || 0)
}

// Helper function to calculate category-specific sales tax
function calculateCategorySalesTax(
  stateData: StateTaxData,
  category: SalesTaxCategory,
  amount: number,
): number {
  const categoryData = stateData.salesTax?.categories?.[category]
  if (!categoryData || !categoryData.taxable) {
    return 0
  }

  // Use the specific category rate, or fall back to combined rate if category rate is 0
  const rate = categoryData.rate > 0 ? categoryData.rate : stateData.salesTax.combinedRate
  return amount * rate // Monthly amount * decimal rate
}

// Helper function to calculate total sales tax for all expense categories
function calculateTotalSalesTax(
  stateData: StateTaxData,
  expenses: {
    groceries?: number
    preparedFood?: number
    utilities?: number
    services?: number
    digitalGoods?: number
    medicine?: number
    streamingSubscriptions?: number
  },
): number {
  let totalSalesTax = 0

  // Calculate tax for each category
  Object.entries(expenses).forEach(([category, amount]) => {
    if (amount && amount > 0) {
      const categoryTax = calculateCategorySalesTax(stateData, category as SalesTaxCategory, amount)
      totalSalesTax += categoryTax
      console.log(`DEBUG: ${category}: $${amount}/month * rate = $${(categoryTax * 12).toFixed(2)}/year`)
    }
  })

  return totalSalesTax * 12 // Convert monthly to annual
}

// Replace the estimateSalesTax function with this simpler version
function estimateSalesTax(stateData: StateTaxData, userInputs: UserTaxInputs): number {
  if (!stateData.salesTax) return 0

  console.log(
    `DEBUG: Calculating sales tax for state with combined rate: ${(stateData.salesTax.combinedRate * 100).toFixed(2)}%`,
  )

  // Use the new helper function for category-specific calculation
  const expenses = {
    groceries: userInputs.groceries || 0,
    preparedFood: userInputs.preparedFood || 0,
    utilities: userInputs.utilities || 0,
    services: userInputs.services || 0,
    digitalGoods: userInputs.digitalGoods || 0,
    medicine: userInputs.medicine || 0,
    streamingSubscriptions: userInputs.streamingSubscriptions || 0,
  }

  const totalSalesTax = calculateTotalSalesTax(stateData, expenses)

  // If no specific expenses provided, use income-based estimate
  if (totalSalesTax === 0) {
    console.log("DEBUG: No specific expenses provided, using income-based estimate")
    const estimatedTaxableSpending = (userInputs.annualIncome + userInputs.retirementIncome) * 0.3
    const combinedRate = stateData.salesTax.combinedRate
    const fallbackTax = estimatedTaxableSpending * combinedRate
    console.log(
      `DEBUG: Income-based estimate: $${estimatedTaxableSpending.toFixed(2)} * ${(combinedRate * 100).toFixed(2)}% = $${fallbackTax.toFixed(2)}`,
    )
    return fallbackTax
  }

  console.log(`DEBUG: Total estimated annual sales tax: $${totalSalesTax.toFixed(2)}`)
  return totalSalesTax
}

// Add near top (below imports) — same helpers as main calculator
type StandardDeductionBracket = { agiMin: number; agiMax: number | null; deduction: number };

function normalizeFilingStatus(fs: string): 'single' | 'married' | 'headOfHousehold' | 'marriedSeparate' {
  const s = (fs || '').toLowerCase().replace(/\s+/g, '');
  if (s.includes('married') && (s.includes('separate') || s.includes('sep'))) return 'marriedSeparate';
  if (s.includes('married')) return 'married';
  if (s.includes('head') || s.includes('hoh')) return 'headOfHousehold';
  return 'single';
}

function resolveStandardDeduction(std: number | StandardDeductionBracket[] | undefined, agi: number): number {
  if (!std) return 0;
  if (typeof std === 'number') return std || 0;
  for (const b of std) {
    const min = b.agiMin ?? 0;
    const max = b.agiMax == null ? Number.POSITIVE_INFINITY : b.agiMax;
    if (agi >= min && agi <= max) {
      console.log('DEBUG: Matched STD bracket', { agi, bracket: b });
      return b.deduction || 0;
    }
  }
  return 0;
}

export function getStandardDeductionForState(stateData: any, filingStatus: string, agi: number): number {
  const key = normalizeFilingStatus(filingStatus);
  const stdInIncomeTax = stateData?.incomeTax?.standardDeduction?.[key] as number | StandardDeductionBracket[] | undefined;
  const stdTopLevel = (stateData as any)?.standardDeduction?.[key] as number | StandardDeductionBracket[] | undefined;
  const std = (stdInIncomeTax ?? stdTopLevel) as number | StandardDeductionBracket[] | undefined;
  const amount = resolveStandardDeduction(std, agi);

  console.log(
    `DEBUG: Standard deduction lookup`,
    {
      state: stateData?.abbreviation || stateData?.name,
      filingStatus: key,
      agi,
      type: Array.isArray(std) ? 'brackets' : 'flat',
      amount
    }
  );

  return amount;
}

// Main function to calculate tax burden for a specific state
export async function calculateStateTaxBurden(
  stateCode: string,
  userInputs: UserTaxInputs,
): Promise<TaxCalculationResult> {
  try {
    console.log(`DEBUG: Calculating tax burden for state: ${stateCode}`)

    // Ensure state tax data is loaded
    const taxData = await stateTaxDataPromise
    const stateData = taxData[stateCode]

    if (!stateData) {
      console.log(`DEBUG: No tax data available for state code: ${stateCode}`)
      throw new Error(`No tax data available for state code: ${stateCode}`)
    }

    console.log(`DEBUG: State data loaded for ${stateCode} - ${stateData.name}`)
    console.log(`DEBUG: Income tax data:`, stateData.incomeTax)

    // Get number of dependents (convert from string to number)
    const numDependents = Number.parseInt(userInputs.dependents) || 0

    // Calculate total income
    const totalIncome =
      userInputs.annualIncome +
      userInputs.investmentIncome +
      userInputs.rentalIncome +
      userInputs.royaltyIncome +
      userInputs.trustIncome

    console.log(`DEBUG: Total income: ${totalIncome}`)

    // Apply state standard deduction (supports flat or bracketed values like AL)
    let stdDeduction = getStandardDeductionForState(stateData as any, userInputs.filingStatus, totalIncome)

    // Arizona: additional standard deduction for age 65+
    if (stateCode === "AZ") {
      const filingKey = normalizeFilingStatus(userInputs.filingStatus)
      const taxpayerIs65Plus = (userInputs.age || 0) >= 65
      const spouseIs65Plus = (userInputs.spouseAge || 0) >= 65

      let azAdditional = 0
      if (filingKey === "married") {
        if (taxpayerIs65Plus) azAdditional += 1600
        if (spouseIs65Plus) azAdditional += 1600
      } else if (filingKey === "marriedSeparate") {
        if (taxpayerIs65Plus) azAdditional += 1600
      } else {
        if (taxpayerIs65Plus) azAdditional += 2000
      }

      console.log('DEBUG: AZ additional standard deduction for age 65+/blind:', azAdditional)
      stdDeduction += azAdditional
    }

    // Delaware: additional standard deduction for age 65+ (ignore blind per requirements)
    if (stateCode === "DE") {
      const filingKey = normalizeFilingStatus(userInputs.filingStatus)
      const taxpayerIs65Plus = (userInputs.age || 0) >= 65
      const spouseIs65Plus = (userInputs.spouseAge || 0) >= 65

      const seniorBenefitAmount: number =
        ((stateData as any)?.standardDeduction?.seniorBenefitAmount) ??
        ((stateData as any)?.incomeTax?.standardDeduction?.seniorBenefitAmount) ??
        2500

      let deAdditional = 0
      if (filingKey === "married") {
        if (taxpayerIs65Plus) deAdditional += seniorBenefitAmount
        if (spouseIs65Plus) deAdditional += seniorBenefitAmount
      } else if (filingKey === "marriedSeparate") {
        if (taxpayerIs65Plus) deAdditional += seniorBenefitAmount
      } else {
        if (taxpayerIs65Plus) deAdditional += seniorBenefitAmount
      }

      console.log('DEBUG: DE additional standard deduction for age 65+:', deAdditional)
      stdDeduction += deAdditional
    }

    const incomeAfterStdDeduction = Math.max(0, totalIncome - stdDeduction)

    console.log(`DEBUG: Standard deduction applied (incl. any AZ additions): ${stdDeduction}`)
    console.log(`DEBUG: Income after standard deduction: ${incomeAfterStdDeduction}`)

    // Calculate income tax
    let incomeTaxBurden = 0
    if (stateData.incomeTax && stateData.incomeTax.hasIncomeTax) {
      console.log(`DEBUG: State has income tax, calculating...`)
      incomeTaxBurden = calculateIncomeTax(
        incomeAfterStdDeduction,
        stateData.incomeTax.brackets,
        userInputs.filingStatus,
        numDependents,
      )
    } else {
      console.log(`DEBUG: State does not have income tax`)
    }
    console.log(`DEBUG: Income tax burden: ${incomeTaxBurden}`)

    // Calculate retirement income tax
    const publicPensionIncome =
      userInputs.teacherPension +
      userInputs.policePension +
      userInputs.firefighterPension +
      userInputs.otherGovernmentPension
    const retirementTaxBurden = calculateRetirementTax(
      stateData,
      userInputs.socialSecurityIncome,
      userInputs.privatePensionIncome,
      publicPensionIncome,
      userInputs.iraDistributions,
      userInputs.filingStatus,
    )
    console.log(`DEBUG: Retirement tax burden: ${retirementTaxBurden}`)

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
    console.log(`DEBUG: Property tax burden: ${propertyTaxBurden}`)

    // Calculate sales tax
    const salesTaxBurden = estimateSalesTax(stateData, userInputs)
    console.log(`DEBUG: Sales tax burden: ${salesTaxBurden}`)

    // Calculate vehicle tax (simplified for debugging)
    const vehicleTaxBurden = 0
    console.log(`DEBUG: Vehicle tax burden: ${vehicleTaxBurden}`)

    // Calculate total tax burden
    const totalTaxBurden = incomeTaxBurden + retirementTaxBurden + propertyTaxBurden + salesTaxBurden + vehicleTaxBurden
    console.log(`DEBUG: Total tax burden: ${totalTaxBurden}`)

    // Check lifestyle match
    const lifestyleMatch = true
    console.log(`DEBUG: Lifestyle match: ${lifestyleMatch}`)

    // Check region match
    const regionMatch = true
    console.log(`DEBUG: Region match: ${regionMatch}`)

    // For the current residence state, savings will be 0
    // For other states, we'll calculate the difference in the getTaxOptimizationRecommendations function
    const estimatedAnnualSavings = 0
    console.log(`DEBUG: Estimated annual savings: ${estimatedAnnualSavings}`)

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
      costOfLivingIndex: stateData.costOfLivingIndex || 100,
      lifestyleMatch,
      regionMatch,
    }
  } catch (error) {
    console.error(`DEBUG ERROR: Error calculating tax burden for ${stateCode}:`, error)
    // Return a placeholder result with zeros
    return {
      stateCode,
      stateName: stateCode,
      totalTaxBurden: 0,
      incomeTaxBurden: 0,
      retirementTaxBurden: 0,
      propertyTaxBurden: 0,
      salesTaxBurden: 0,
      vehicleTaxBurden: 0,
      estimatedAnnualSavings: 0,
      costOfLivingIndex: 100,
      lifestyleMatch: false,
      regionMatch: false,
    }
  }
}
