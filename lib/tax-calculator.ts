console.log("TAX CALCULATOR MODULE LOADED");

import {
  stateTaxDataPromise,
  type StateTaxData,
  type StateTaxBracket,
  type FilingStatusBrackets,
  type SalesTaxCategory,
} from "./state-tax-data"

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
  annualIncome: number
  retirementIncome: number
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
  currentPropertyTax: number
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
  console.log("Getting brackets for filing status:", filingStatus)

  // If brackets is an array, it means there's only one set of brackets for all filing statuses
  if (Array.isArray(brackets)) {
    console.log("Brackets is an array, returning directly")
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
    console.log("Unknown filing status, defaulting to single")
    dataFilingStatus = "single" // Default to single for unknown filing statuses
  }

  console.log("Mapped filing status:", dataFilingStatus)

  // Get the brackets for the specified filing status
  // Default to single if the filing status doesn't exist
  const result = brackets[dataFilingStatus as keyof FilingStatusBrackets] || brackets.single || []
  console.log(`Found ${result.length} brackets for ${dataFilingStatus}`)

  return result
}

// Calculate income tax based on brackets
function calculateIncomeTax(
  income: number,
  brackets: FilingStatusBrackets | StateTaxBracket[],
  filingStatus: string,
  dependents = 0, // Add dependents parameter with default value
): number {
  console.log("Calculating income tax for income:", income, "filing status:", filingStatus)

  // Get the appropriate brackets based on filing status
  const applicableBrackets = getBracketsByFilingStatus(brackets, filingStatus)

  if (!applicableBrackets || applicableBrackets.length === 0) {
    console.log("No applicable brackets found, returning 0")
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

    console.log(`Bracket ${i + 1}: min=${min}, max=${max}, rate=${rate}`)

    if (income <= min) {
      // Income is below this bracket
      break
    }

    const taxableInThisBracket = Math.min(income, max) - min
    console.log(`Taxable in bracket ${i + 1}: ${taxableInThisBracket}`)

    if (taxableInThisBracket <= 0) continue

    const taxForBracket = taxableInThisBracket * rate
    console.log(`Tax for bracket ${i + 1}: ${taxForBracket}`)

    tax += taxForBracket

    if (income <= max) {
      // We've reached the highest applicable bracket
      break
    }
  }

  console.log("Total calculated income tax:", tax)
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
  userInputs?: UserTaxInputs, // Add userInputs parameter for Arizona-specific rules
): number {
  console.log("RETIREMENT TAX DEBUG:", {
    state: stateData.abbreviation,
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    retirementIncome: stateData.retirementIncome,
  });

  if (!stateData.incomeTax || !stateData.incomeTax.hasIncomeTax) {
    console.log("RETIREMENT TAX DEBUG: Early return, no income tax", stateData.abbreviation);
    return 0;
  }

  // Arizona-specific retirement income calculation
  if (stateData.abbreviation === "AZ") {
    return calculateArizonaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      userInputs
    );
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

// Arizona-specific retirement income tax calculation
function calculateArizonaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  userInputs?: UserTaxInputs,
): number {
  console.log("ARIZONA RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    userInputs,
  });

  let taxableRetirementIncome = 0;

  // Social Security is NOT taxed in Arizona
  // taxableRetirementIncome += 0; // Explicitly showing it's not added

  // Private pension income is taxed at 2.5%
  taxableRetirementIncome += privatePensionIncome;

  // Traditional IRA distributions are taxed at 2.5%
  taxableRetirementIncome += iraDistributions;

  // Military retirement is NOT taxed in Arizona
  if (userInputs?.militaryRetirementPay) {
    // taxableRetirementIncome += 0; // Explicitly showing it's not added
    console.log("Military retirement pay excluded from Arizona taxation:", userInputs.militaryRetirementPay);
  }

  // Teacher, police, and firefighter pensions have special exemptions
  let teacherPoliceFirefighterIncome = 0;
  if (userInputs) {
    teacherPoliceFirefighterIncome = 
      (userInputs.teacherPension || 0) +
      (userInputs.policePension || 0) +
      (userInputs.firefighterPension || 0);
  }

  // Apply exemption for teacher/police/firefighter pensions
  let exemption = 0;
  if (stateData.retirementIncome?.teacherPoliceFirefighterExemption) {
    // Determine if this is a married couple with both spouses having qualifying pensions
    const isMarried = filingStatus.toLowerCase().includes("married");
    
    if (isMarried && stateData.retirementIncome.teacherPoliceFirefighterExemptionMarried) {
      // Check if both spouses worked in qualifying jobs
      const spouse1Qualifying = userInputs?.spouse1QualifyingJob || false;
      const spouse2Qualifying = userInputs?.spouse2QualifyingJob || false;
      
      if (spouse1Qualifying && spouse2Qualifying) {
        exemption = stateData.retirementIncome.teacherPoliceFirefighterExemptionMarried; // $5,000 for both spouses
        console.log("Both spouses worked in qualifying jobs, using $5,000 exemption");
      } else if (spouse1Qualifying || spouse2Qualifying) {
        exemption = stateData.retirementIncome.teacherPoliceFirefighterExemption; // $2,500 for one spouse
        console.log("One spouse worked in qualifying job, using $2,500 exemption");
      } else {
        exemption = 0; // No qualifying jobs
        console.log("No spouses worked in qualifying jobs, no exemption");
      }
    } else {
      // Single person or unmarried - check if they have qualifying job
      const hasQualifyingJob = (userInputs?.teacherPension || 0) > 0 || 
                              (userInputs?.policePension || 0) > 0 || 
                              (userInputs?.firefighterPension || 0) > 0;
      
      if (hasQualifyingJob) {
        exemption = stateData.retirementIncome.teacherPoliceFirefighterExemption; // $2,500 per person
        console.log("Single person with qualifying job, using $2,500 exemption");
      } else {
        exemption = 0;
        console.log("Single person without qualifying job, no exemption");
      }
    }
  }

  const taxableTeacherPoliceFirefighterIncome = Math.max(0, teacherPoliceFirefighterIncome - exemption);
  taxableRetirementIncome += taxableTeacherPoliceFirefighterIncome;

  // Other public pensions (non-teacher/police/firefighter) are taxed at 2.5%
  const otherPublicPensionIncome = Math.max(0, publicPensionIncome - teacherPoliceFirefighterIncome);
  taxableRetirementIncome += otherPublicPensionIncome;

  console.log("Arizona retirement tax calculation:", {
    privatePensionIncome,
    iraDistributions,
    teacherPoliceFirefighterIncome,
    exemption,
    taxableTeacherPoliceFirefighterIncome,
    otherPublicPensionIncome,
    totalTaxableRetirementIncome: taxableRetirementIncome,
  });

  // Arizona has a flat 2.5% tax rate on all income
  const arizonaTaxRate = 0.025; // 2.5%
  return taxableRetirementIncome * arizonaTaxRate;
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
      console.log(`${category}: $${amount}/month * rate = $${(categoryTax * 12).toFixed(2)}/year`)
    }
  })

  return totalSalesTax * 12 // Convert monthly to annual
}

// Replace the estimateSalesTax function with this simpler version
function estimateSalesTax(stateData: StateTaxData, userInputs: UserTaxInputs): number {
  if (!stateData.salesTax) return 0

  console.log(
    `Calculating sales tax for state with combined rate: ${(stateData.salesTax.combinedRate * 100).toFixed(2)}%`,
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
    console.log("No specific expenses provided, using income-based estimate")
    const estimatedTaxableSpending = (userInputs.annualIncome + userInputs.retirementIncome) * 0.3
    const combinedRate = stateData.salesTax.combinedRate
    const fallbackTax = estimatedTaxableSpending * combinedRate
    console.log(
      `Income-based estimate: $${estimatedTaxableSpending.toFixed(2)} * ${(combinedRate * 100).toFixed(2)}% = $${fallbackTax.toFixed(2)}`,
    )
    return fallbackTax
  }

  console.log(`Total estimated annual sales tax: $${totalSalesTax.toFixed(2)}`)
  return totalSalesTax
}

// Calculate vehicle tax based on state-specific rules
function calculateVehicleTax(stateData: StateTaxData, userInputs: UserTaxInputs): number {
  // If no vehicle tax rules are defined for the state, use the simplified calculation
  if (!stateData.vehicleTax) {
    return userInputs.vehicleValue * (stateData.propertyTax?.averageEffectiveRate / 200 || 0)
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
  return stateData.lifestyleTags?.includes(preferredLifestyle) || false
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
  console.log("STATE TAX BURDEN CALCULATION STARTED", stateCode, userInputs);

  try {
    console.log(`Calculating tax burden for state: ${stateCode}`)

    // Ensure state tax data is loaded
    const taxData = await stateTaxDataPromise
    const stateData = taxData[stateCode]

    console.log("STATE DATA FOR", stateCode, ":", stateData);

    if (!stateData) {
      throw new Error(`No tax data available for state code: ${stateCode}`)
    }

    // Get number of dependents (convert from string to number)
    const numDependents = Number.parseInt(userInputs.dependents) || 0

    // Calculate total income
    const totalIncome =
      userInputs.annualIncome +
      userInputs.investmentIncome +
      userInputs.rentalIncome +
      userInputs.royaltyIncome +
      userInputs.trustIncome

    console.log(`Total income: ${totalIncome}`)

    // Calculate income tax
    let incomeTaxBurden = 0
    if (stateData.incomeTax && stateData.incomeTax.hasIncomeTax) {
      incomeTaxBurden = calculateIncomeTax(
        totalIncome,
        stateData.incomeTax.brackets,
        userInputs.filingStatus,
        numDependents,
      )
    }
    console.log(`Income tax burden: ${incomeTaxBurden}`)

    // Calculate retirement income tax
    console.log("CALLING calculateRetirementTax for", stateCode, userInputs);
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
      65, // Default age
      userInputs // Pass userInputs for Arizona-specific rules
    )
    console.log(`Retirement tax burden: ${retirementTaxBurden}`)

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
    console.log(`Property tax burden: ${propertyTaxBurden}`)

    // Calculate sales tax using the enhanced function with updated data
    const salesTaxBurden = estimateSalesTax(stateData, userInputs)
    console.log(`Sales tax burden: ${salesTaxBurden}`)

    // Calculate vehicle-related taxes
    const vehicleTaxBurden = calculateVehicleTax(stateData, userInputs)
    console.log(`Vehicle tax burden: ${vehicleTaxBurden}`)

    // Calculate total tax burden
    const totalTaxBurden = incomeTaxBurden + retirementTaxBurden + propertyTaxBurden + salesTaxBurden + vehicleTaxBurden
    console.log(`Total tax burden: ${totalTaxBurden}`)

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
      costOfLivingIndex: stateData.costOfLivingIndex || 100,
      lifestyleMatch,
      regionMatch,
    }
  } catch (error) {
    console.error(`Error calculating tax burden for ${stateCode}:`, error)
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

// Function to get tax optimization recommendations
export async function getTaxOptimizationRecommendations(
  userInputs: UserTaxInputs,
  topCount = 5,
): Promise<TaxCalculationResult[]> {
  console.log("Starting tax optimization recommendations calculation...")

  try {
    // First, calculate the current state tax burden
    const currentStateResult = await calculateStateTaxBurden(userInputs.residenceState, userInputs)
    const currentStateTaxBurden = currentStateResult.totalTaxBurden

    console.log("Current state tax burden:", currentStateTaxBurden)

    // Ensure state tax data is loaded
    const taxData = await stateTaxDataPromise
    console.log("Tax data loaded for states:", Object.keys(taxData).length)
    console.log("ALL STATE CODES:", Object.keys(taxData));

    // Calculate tax burden for all states
    const allStateResultsPromises = Object.keys(taxData).map(async (stateCode) => {
      try {
        const result = await calculateStateTaxBurden(stateCode, userInputs)

        // Calculate savings compared to current state
        result.estimatedAnnualSavings = currentStateTaxBurden - result.totalTaxBurden

        return result
      } catch (error) {
        console.error(`Error calculating for state ${stateCode}:`, error)
        // Return a placeholder result for states that fail
        return {
          stateCode,
          stateName: taxData[stateCode]?.name || stateCode,
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
        } as TaxCalculationResult
      }
    })

    // Wait for all calculations to complete
    const allStateResults = await Promise.all(allStateResultsPromises)
    console.log("Calculated results for all states:", allStateResults.length)

    // Apply filters based on user preferences
    let filteredResults = allStateResults

    // Filter by lifestyle preference if specified
    if (userInputs.preferredLifestyle && userInputs.preferredLifestyle !== "indifferent") {
      const lifestyleFiltered = filteredResults.filter((result) => result.lifestyleMatch)

      // Only apply the filter if we have matching states
      if (lifestyleFiltered.length > 0) {
        filteredResults = lifestyleFiltered
        console.log("Filtered by lifestyle, remaining states:", filteredResults.length)
      }
    }

    // Filter by region preference if specified
    if (userInputs.regionPreference && userInputs.regionPreference !== "indifferent") {
      const regionFiltered = filteredResults.filter((result) => result.regionMatch)

      // Only apply the filter if we have matching states
      if (regionFiltered.length > 0) {
        filteredResults = regionFiltered
        console.log("Filtered by region, remaining states:", filteredResults.length)
      }
    }

    // Ensure base state is always included
    if (!filteredResults.some(r => r.stateCode === userInputs.residenceState)) {
      const baseStateResult = allStateResults.find(r => r.stateCode === userInputs.residenceState);
      if (baseStateResult) {
        filteredResults.push(baseStateResult);
      }
    }

    // Sort by estimated annual savings (highest first)
    const sortedResults = filteredResults.sort((a, b) => b.estimatedAnnualSavings - a.estimatedAnnualSavings)
    console.log("Sorted results, top state:", sortedResults[0]?.stateCode)

    // Return top states
    const topStates = sortedResults.slice(0, topCount)
    console.log("ALL RESULT STATE CODES:", topStates.map(r => r.stateCode));
    return topStates
  } catch (error) {
    console.error("Error in getTaxOptimizationRecommendations:", error)
    throw error
  }
}
