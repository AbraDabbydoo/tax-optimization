console.log("TAX CALCULATOR MODULE LOADED");

import {
  stateTaxDataPromise,
  type StateTaxData,
  type StateTaxBracket,
  type FilingStatusBrackets,
  type SalesTaxCategory,
} from "./state-tax-data"
import { calculateConnecticutPersonalExemption } from "./utils"

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
  age: number // Primary taxpayer age
  spouseAge?: number // Spouse age for married filing jointly
  annualIncome: number
  retirementIncome: number
  socialSecurityIncome: number
  privatePensionIncome: number
  teacherPension: number
  policePension: number
  firefighterPension: number
  militaryRetirementPay: number
  otherGovernmentPension: number
  iraDistributions: number // Traditional IRA, SEP, Keogh distributions (Roth IRA distributions should be excluded as they are not taxable)
  k401Distributions: number // 401k/403b/457b distributions (separate from traditional IRA/Roth IRA/SEP/Keogh)
  investmentIncome: number
  rentalIncome?: number
  royaltyIncome: number
  trustIncome: number
  interestIncome?: number // Taxable interest income (for NH)
  dividendsIncome?: number // Taxable dividends income (for NH)
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
  privatePensionEmployeeContributionPortion?: string
  // Kentucky-specific fields for pre-1998 service
  kyMilitaryRetiredBefore1998?: boolean
  kyTeacherPoliceFirePre1998Percent?: number
  // Montana-specific fields for military retirement residency requirements
  becameMontanaResidentBeforeJuly2023?: boolean
  beganMilitaryBenefitsBeforeMontanaResidency?: boolean
  ncBaileyExemption?: boolean
  annuityIncome?: number // Taxable annuity income (new field for OH and other states)
  // Alabama homestead exemption fields
  alHomesteadExemptionType?: 'H-1' | 'H-2' | 'H-3' | 'H-4' // Which exemption type applies
  alIsDisabled?: boolean // For H-3 exemption (permanently disabled)
  alIsPrimaryResidence?: boolean // Must be primary residence
  alPropertyAcres?: number // Must be ≤ 160 acres for single-family
  // Alabama alimony deduction fields
  alAlimonyPaid?: number // Annual alimony payments made
  alDivorceDate?: string // Date of divorce/separation agreement (YYYY-MM-DD format)
  alIsAlimonyRecipient?: boolean // Whether taxpayer is receiving alimony (for completeness)
  selfEmploymentIncome?: number
  unemploymentIncome?: number
  alimonyReceived?: number
  alimonyDivorceDate?: string
  gamblingWinnings?: number
  capitalGains?: number
  shortTermCapitalGains?: number
  longTermCapitalGains?: number
  selfEmploymentExpenses?: number
  nextHomeValue?: number // New field for next home value
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

  // Arkansas-specific retirement income calculation
  if (stateData.abbreviation === "AR") {
    return calculateArkansasRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // California-specific retirement income calculation
  if (stateData.abbreviation === "CA") {
    return calculateCaliforniaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Colorado-specific retirement income calculation
  if (stateData.abbreviation === "CO") {
    return calculateColoradoRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Connecticut-specific retirement income calculation
  if (stateData.abbreviation === "CT") {
    return calculateConnecticutRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Delaware-specific retirement income calculation
  if (stateData.abbreviation === "DE") {
    return calculateDelawareRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Georgia-specific retirement income calculation
  if (stateData.abbreviation === "GA") {
    return calculateGeorgiaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Hawaii-specific retirement income calculation
  if (stateData.abbreviation === "HI") {
    return calculateHawaiiRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Idaho-specific retirement income calculation
  // Note: Idaho calculates income tax from federal AGI with additions/subtractions
  if (stateData.abbreviation === "ID") {
    return calculateIdahoRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Indiana-specific retirement income calculation
  if (stateData.abbreviation === "IN") {
    return calculateIndianaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Kansas-specific retirement income calculation
  if (stateData.abbreviation === "KS") {
    return calculateKansasRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Kentucky-specific retirement income calculation
  if (stateData.abbreviation === "KY") {
    return calculateKentuckyRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Maine-specific retirement income calculation
  if (stateData.abbreviation === "ME") {
    return calculateMaineRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Maryland-specific retirement income tax calculation
  if (stateData.abbreviation === "MD") {
    return calculateMarylandRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Massachusetts-specific retirement income tax calculation
  if (stateData.abbreviation === "MA") {
    return calculateMassachusettsRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Michigan-specific retirement income tax calculation
  if (stateData.abbreviation === "MI") {
    return calculateMichiganRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Minnesota-specific retirement income tax calculation
  if (stateData.abbreviation === "MN") {
    return calculateMinnesotaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Missouri-specific retirement income tax calculation
  if (stateData.abbreviation === "MO") {
    return calculateMissouriRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Montana-specific retirement income tax calculation
  if (stateData.abbreviation === "MT") {
    return calculateMontanaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Nebraska-specific retirement income tax calculation
  if (stateData.abbreviation === "NE") {
    return calculateNebraskaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // New Jersey-specific retirement income tax calculation
  if (stateData.abbreviation === "NJ") {
    return calculateNewJerseyRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // New Mexico-specific retirement income tax calculation
  if (stateData.abbreviation === "NM") {
    return calculateNewMexicoRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // New York-specific retirement income tax calculation
  if (stateData.abbreviation === "NY") {
    return calculateNewYorkRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // North Carolina-specific retirement income tax calculation
  if (stateData.abbreviation === "NC") {
    return calculateNorthCarolinaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // North Dakota-specific retirement income tax calculation
  if (stateData.abbreviation === "ND") {
    return calculateNorthDakotaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Ohio-specific retirement income calculation
  if (stateData.abbreviation === "OH") {
    return calculateOhioRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      userInputs?.k401Distributions || 0,
      userInputs?.annuityIncome || 0,
      userInputs?.militaryRetirementPay || 0,
      filingStatus,
      age,
      userInputs
    );
  }

  // Oklahoma-specific retirement income tax calculation
  if (stateData.abbreviation === "OK") {
    return calculateOklahomaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Oregon-specific retirement income tax calculation
  if (stateData.abbreviation === "OR") {
    return calculateOregonRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Pennsylvania-specific retirement income tax calculation
  if (stateData.abbreviation === "PA") {
    return calculatePennsylvaniaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Rhode Island-specific retirement income tax calculation
  if (stateData.abbreviation === "RI") {
    return calculateRhodeIslandRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // South Carolina-specific retirement income tax calculation
  if (stateData.abbreviation === "SC") {
    return calculateSouthCarolinaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Utah-specific retirement income tax calculation
  if (stateData.abbreviation === "UT") {
    return calculateUtahRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Vermont-specific retirement income tax calculation
  if (stateData.abbreviation === "VT") {
    return calculateVermontRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Virginia-specific retirement income tax calculation
  if (stateData.abbreviation === "VA") {
    return calculateVirginiaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // West Virginia-specific retirement income tax calculation
  if (stateData.abbreviation === "WV") {
    return calculateWestVirginiaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Wisconsin-specific retirement income tax calculation
  if (stateData.abbreviation === "WI") {
    return calculateWisconsinRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // District of Columbia-specific retirement income tax calculation
  if (stateData.abbreviation === "DC") {
    return calculateDistrictOfColumbiaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
      userInputs
    );
  }

  // Alabama-specific retirement income tax calculation
  if (stateData.abbreviation === "AL") {
    return calculateAlabamaRetirementTax(
      stateData,
      socialSecurityIncome,
      privatePensionIncome,
      publicPensionIncome,
      iraDistributions,
      filingStatus,
      age,
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

// Kentucky-specific retirement income tax calculation
function calculateKentuckyRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += iraDistributions;

  // Handle military retirement based on retirement date
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  if (userInputs?.kyMilitaryRetiredBefore1998) {
    // Fully exempt if retired before 1998
    console.log("Kentucky: Military retired before 1998, fully exempt:", militaryRetirement);
  } else {
    // Subject to $31,110 exclusion if retired after 1998
    totalRetirementIncome += militaryRetirement;
  }

  // Handle teacher/police/firefighter pensions based on pre-1998 service
  const teacherPension = userInputs?.teacherPension || 0;
  const policePension = userInputs?.policePension || 0;
  const firefighterPension = userInputs?.firefighterPension || 0;
  const totalTeacherPoliceFire = teacherPension + policePension + firefighterPension;

  if (totalTeacherPoliceFire > 0 && userInputs?.kyTeacherPoliceFirePre1998Percent) {
    const pre1998Percent = userInputs.kyTeacherPoliceFirePre1998Percent / 100;
    const pre1998Exempt = totalTeacherPoliceFire * pre1998Percent;
    const post1998Taxable = totalTeacherPoliceFire - pre1998Exempt;
    
    console.log("Kentucky: Teacher/police/firefighter pre-1998 exempt:", pre1998Exempt, "post-1998 taxable:", post1998Taxable);
    totalRetirementIncome += post1998Taxable;
  } else {
    // No pre-1998 service specified, treat all as post-1998
    totalRetirementIncome += totalTeacherPoliceFire;
  }

  // Exclusion per person
  let exclusion = 31110;
  const isMarried = filingStatus.toLowerCase().includes("married");
  if (isMarried && userInputs?.spouseAge !== undefined) {
    exclusion *= 2;
  }
  const taxableRetirementIncome = Math.max(0, totalRetirementIncome - exclusion);

  // KY flat tax rate is 4%
  return taxableRetirementIncome * 0.04;
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

// Arkansas-specific retirement income tax calculation
function calculateArkansasRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("ARKANSAS RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    spouseAge: userInputs?.spouseAge,
    userInputs,
  });

  let taxableRetirementIncome = 0;

  // Social Security is NOT taxed in Arkansas
  // taxableRetirementIncome += 0; // Explicitly showing it's not added

  // Military retirement is NOT taxed in Arkansas
  if (userInputs?.militaryRetirementPay) {
    // taxableRetirementIncome += 0; // Explicitly showing it's not added
    console.log("Military retirement pay excluded from Arkansas taxation:", userInputs.militaryRetirementPay);
  }

  // Calculate total retirement income that could be subject to exemption
  let totalRetirementIncomeForExemption = 0;

  // Private pension income is taxable
  totalRetirementIncomeForExemption += privatePensionIncome;

  // Teacher, police, and firefighter pensions are taxable
  let teacherPoliceFirefighterIncome = 0;
  if (userInputs) {
    teacherPoliceFirefighterIncome = 
      (userInputs.teacherPension || 0) +
      (userInputs.policePension || 0) +
      (userInputs.firefighterPension || 0);
  }
  totalRetirementIncomeForExemption += teacherPoliceFirefighterIncome;

  // IRA distributions are taxable (but only if 59.5+ for exemption purposes)
  // For married filing jointly, check if either spouse is 59.5+
  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge || age; // Default to primary age if spouse age not provided
  const primaryQualifiesForIraExemption = age >= 59.5;
  const spouseQualifiesForIraExemption = spouseAge >= 59.5;
  
  if (isMarried) {
    // For married filing jointly, if either spouse is 59.5+, IRA distributions qualify for exemption
    if (primaryQualifiesForIraExemption || spouseQualifiesForIraExemption) {
      totalRetirementIncomeForExemption += iraDistributions;
      console.log("Married filing jointly - IRA distributions qualify for exemption (primary age:", age, "spouse age:", spouseAge, ")");
    } else {
      // If both spouses are under 59.5, IRA distributions are fully taxable
      taxableRetirementIncome += iraDistributions;
      console.log("Married filing jointly - IRA distributions fully taxable (both spouses under 59.5)");
    }
  } else {
    // Single filing - only primary age matters
    if (primaryQualifiesForIraExemption) {
      totalRetirementIncomeForExemption += iraDistributions;
      console.log("Single filing - IRA distributions qualify for exemption (age:", age, ")");
    } else {
      taxableRetirementIncome += iraDistributions;
      console.log("Single filing - IRA distributions fully taxable (under 59.5)");
    }
  }

  // Other public pensions (non-teacher/police/firefighter) are taxable
  const otherPublicPensionIncome = Math.max(0, publicPensionIncome - teacherPoliceFirefighterIncome);
  totalRetirementIncomeForExemption += otherPublicPensionIncome;

  // Apply Arkansas exemption: $6,000 per person
  let exemption = 6000; // $6,000 per person
  if (isMarried) {
    // For married filing jointly, both spouses must be 59.5+ to get the full $12,000 exemption
    if (primaryQualifiesForIraExemption && spouseQualifiesForIraExemption) {
      exemption *= 2; // $12,000 for married couples (both spouses 59.5+)
      console.log("Married filing jointly - both spouses 59.5+, using $12,000 exemption");
    } else if (primaryQualifiesForIraExemption || spouseQualifiesForIraExemption) {
      // Only one spouse is 59.5+, so only $6,000 exemption
      exemption = 6000; // $6,000 for married couples (only one spouse 59.5+)
      console.log("Married filing jointly - only one spouse 59.5+, using $6,000 exemption");
    } else {
      // Neither spouse is 59.5+, so no exemption for IRA distributions
      exemption = 0; // No exemption for married couples (neither spouse 59.5+)
      console.log("Married filing jointly - neither spouse 59.5+, no exemption for IRA distributions");
    }
  } else {
    // Single filing - only primary age matters
    if (!primaryQualifiesForIraExemption) {
      exemption = 0; // No exemption for single filers under 59.5
      console.log("Single filing - under 59.5, no exemption for IRA distributions");
    }
  }

  // Apply exemption to the total retirement income
  const taxableRetirementIncomeAfterExemption = Math.max(0, totalRetirementIncomeForExemption - exemption);
  taxableRetirementIncome += taxableRetirementIncomeAfterExemption;

  console.log("Arkansas retirement tax calculation:", {
    privatePensionIncome,
    teacherPoliceFirefighterIncome,
    iraDistributions,
    age,
    spouseAge,
    isMarried,
    primaryQualifiesForIraExemption,
    spouseQualifiesForIraExemption,
    otherPublicPensionIncome,
    totalRetirementIncomeForExemption,
    exemption,
    taxableRetirementIncomeAfterExemption,
    totalTaxableRetirementIncome: taxableRetirementIncome,
  });

  // Calculate tax using Arkansas income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// California-specific retirement income tax calculation
function calculateCaliforniaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("CALIFORNIA RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  let taxableRetirementIncome = 0;

  // In California, ALL retirement income is taxed at normal rates
  // Social Security is NOT taxed federally, but California doesn't tax it either
  // taxableRetirementIncome += 0; // Explicitly showing it's not added

  // All other retirement income is taxable at normal California rates
  taxableRetirementIncome += privatePensionIncome;
  taxableRetirementIncome += publicPensionIncome;
  taxableRetirementIncome += iraDistributions;

  // Military retirement is also taxed at normal rates in California
  if (userInputs?.militaryRetirementPay) {
    taxableRetirementIncome += userInputs.militaryRetirementPay;
    console.log("Military retirement pay included in California taxation:", userInputs.militaryRetirementPay);
  }

  console.log("California retirement tax calculation:", {
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    militaryRetirementPay: userInputs?.militaryRetirementPay || 0,
    totalTaxableRetirementIncome: taxableRetirementIncome,
  });

  // Calculate tax using California income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Colorado-specific retirement income tax calculation
function calculateColoradoRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("COLORADO RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    spouseAge: userInputs?.spouseAge,
    userInputs,
  });

  // Calculate total retirement income that qualifies for the deduction
  let totalRetirementIncome = 0;

  // Include all types of retirement income
  totalRetirementIncome += socialSecurityIncome;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += iraDistributions;

  // Include military retirement pay
  if (userInputs?.militaryRetirementPay) {
    totalRetirementIncome += userInputs.militaryRetirementPay;
    console.log("Military retirement pay included in Colorado retirement income:", userInputs.militaryRetirementPay);
  }

  // Determine deduction amount based on age
  let deductionPerPerson = 0;
  if (age >= 65) {
    deductionPerPerson = 24000; // $24,000 for ages 65+
    console.log("Colorado: Age 65+, using $24,000 deduction per person");
  } else if (age >= 55) {
    deductionPerPerson = 20000; // $20,000 for ages 55-64
    console.log("Colorado: Age 55-64, using $20,000 deduction per person");
  } else {
    deductionPerPerson = 0; // No deduction for under 55
    console.log("Colorado: Under age 55, no retirement income deduction");
  }

  // For married filing jointly, check spouse age and apply appropriate deduction
  const isMarried = filingStatus.toLowerCase().includes("married");
  let totalDeduction = deductionPerPerson;

  if (isMarried && userInputs?.spouseAge) {
    const spouseAge = userInputs.spouseAge;
    let spouseDeduction = 0;
    
    if (spouseAge >= 65) {
      spouseDeduction = 24000; // $24,000 for ages 65+
      console.log("Colorado: Spouse age 65+, using $24,000 deduction");
    } else if (spouseAge >= 55) {
      spouseDeduction = 20000; // $20,000 for ages 55-64
      console.log("Colorado: Spouse age 55-64, using $20,000 deduction");
    } else {
      spouseDeduction = 0; // No deduction for under 55
      console.log("Colorado: Spouse under age 55, no deduction");
    }
    
    totalDeduction += spouseDeduction;
    console.log("Colorado: Married filing jointly, total deduction:", totalDeduction);
  }

  // Apply the deduction to the total retirement income
  const taxableRetirementIncome = Math.max(0, totalRetirementIncome - totalDeduction);

  console.log("Colorado retirement tax calculation:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    militaryRetirementPay: userInputs?.militaryRetirementPay || 0,
    totalRetirementIncome,
    age,
    spouseAge: userInputs?.spouseAge,
    isMarried,
    deductionPerPerson,
    totalDeduction,
    taxableRetirementIncome,
  });

  // Calculate tax using Colorado income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Connecticut-specific retirement income tax calculation
function calculateConnecticutRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("CONNECTICUT RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  // Social Security is NOT taxed in Connecticut
  // taxableRetirementIncome += 0; // Explicitly showing it's not added

  // Calculate total retirement income that qualifies for the sliding scale exemption
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += iraDistributions;

  // Military retirement is EXEMPT in Connecticut - do not include in taxable income
  if (userInputs?.militaryRetirementPay) {
    console.log("Military retirement pay excluded from Connecticut taxation:", userInputs.militaryRetirementPay);
  }

  // Calculate Connecticut AGI (simplified - using total income as proxy)
  const connecticutAGI = 
    userInputs?.annualIncome || 0 +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    totalRetirementIncome;

  console.log("Connecticut AGI calculation:", {
    annualIncome: userInputs?.annualIncome || 0,
    investmentIncome: userInputs?.investmentIncome || 0,
    rentalIncome: userInputs?.rentalIncome || 0,
    royaltyIncome: userInputs?.royaltyIncome || 0,
    trustIncome: userInputs?.trustIncome || 0,
    totalRetirementIncome,
    connecticutAGI,
  });

  // Determine if Social Security should be included in the exemption calculation
  let includeSocialSecurityInExemption = false;
  const isSingleFiler = filingStatus.toLowerCase() === "single" || 
                       filingStatus.toLowerCase() === "head-of-household" ||
                       filingStatus.toLowerCase() === "headofhousehold" ||
                       filingStatus.toLowerCase() === "hoh";

  if (isSingleFiler) {
    // Single, MFS, or HoH: AGI < $75,000 gets 100% Social Security exemption
    if (connecticutAGI < 75000) {
      console.log("Connecticut: Single/MFS/HoH AGI < $75,000, Social Security 100% exempt");
    } else {
      includeSocialSecurityInExemption = true;
      console.log("Connecticut: Single/MFS/HoH AGI ≥ $75,000, Social Security included in sliding scale");
    }
  } else {
    // Married filing jointly: AGI < $100,000 gets 100% Social Security exemption
    if (connecticutAGI < 100000) {
      console.log("Connecticut: Married AGI < $100,000, Social Security 100% exempt");
    } else {
      includeSocialSecurityInExemption = true;
      console.log("Connecticut: Married AGI ≥ $100,000, Social Security included in sliding scale");
    }
  }

  // Add Social Security to total retirement income if it should be included in the exemption calculation
  if (includeSocialSecurityInExemption) {
    totalRetirementIncome += socialSecurityIncome;
    console.log("Social Security income added to Connecticut retirement income for exemption calculation:", socialSecurityIncome);
  }

  // Determine exemption percentage based on filing status and AGI
  let exemptionPercentage = 0;
  
  // Determine if this is a single filer or married filing separately
  if (isSingleFiler) {
    // Single / MFS / HoH filing status
    if (connecticutAGI <= 75000) {
      exemptionPercentage = 100; // 100% exempt
      console.log("Connecticut: AGI ≤ $75,000, 100% exemption");
    } else if (connecticutAGI <= 77499) {
      exemptionPercentage = 85; // 85% exempt
      console.log("Connecticut: AGI $75,000–77,499, 85% exemption");
    } else if (connecticutAGI <= 79999) {
      exemptionPercentage = 80; // 80% exempt
      console.log("Connecticut: AGI $77,500–79,999, 80% exemption");
    } else if (connecticutAGI <= 84999) {
      exemptionPercentage = 70; // 70% exempt
      console.log("Connecticut: AGI $80,000–84,999, 70% exemption");
    } else if (connecticutAGI <= 89999) {
      exemptionPercentage = 50; // 50% exempt
      console.log("Connecticut: AGI $85,000–89,999, 50% exemption");
    } else if (connecticutAGI <= 94999) {
      exemptionPercentage = 25; // 25% exempt
      console.log("Connecticut: AGI $90,000–94,999, 25% exemption");
    } else {
      exemptionPercentage = 0; // No exemption
      console.log("Connecticut: AGI ≥ $95,000, no exemption");
    }
  } else {
    // Married filing jointly - use different thresholds (typically double the single thresholds)
    if (connecticutAGI <= 100000) {
      exemptionPercentage = 100; // 100% exempt
      console.log("Connecticut: Married AGI ≤ $100,000, 100% exemption");
    } else if (connecticutAGI <= 104999) {
      exemptionPercentage = 85; // 85% exempt
      console.log("Connecticut: Married AGI $100,000–104,999, 85% exemption");
    } else if (connecticutAGI <= 109999) {
      exemptionPercentage = 80; // 80% exempt
      console.log("Connecticut: Married AGI $105,000–109,999, 80% exemption");
    } else if (connecticutAGI <= 119999) {
      exemptionPercentage = 70; // 70% exempt
      console.log("Connecticut: Married AGI $110,000–119,999, 70% exemption");
    } else if (connecticutAGI <= 129999) {
      exemptionPercentage = 50; // 50% exempt
      console.log("Connecticut: Married AGI $120,000–129,999, 50% exemption");
    } else if (connecticutAGI <= 139999) {
      exemptionPercentage = 25; // 25% exempt
      console.log("Connecticut: Married AGI $130,000–139,999, 25% exemption");
    } else {
      exemptionPercentage = 0; // No exemption
      console.log("Connecticut: Married AGI ≥ $140,000, no exemption");
    }
  }

  // Calculate the exempt amount
  const exemptAmount = totalRetirementIncome * (exemptionPercentage / 100);
  const taxableRetirementIncome = totalRetirementIncome - exemptAmount;

  console.log("Connecticut retirement tax calculation:", {
    totalRetirementIncome,
    connecticutAGI,
    filingStatus,
    isSingleFiler,
    exemptionPercentage,
    exemptAmount,
    taxableRetirementIncome,
  });

  // Calculate tax using Connecticut income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Delaware-specific retirement income tax calculation
function calculateDelawareRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed in Delaware
  // Only eligible retirement income is considered for exclusion
  // Eligible: private/public/teacher/police/firefighter pensions, IRA, 401k, Keogh, 457, interest, dividends, capital gains, net rental, etc.
  // We'll sum: privatePensionIncome, publicPensionIncome, teacherPension, policePension, firefighterPension, iraDistributions, investmentIncome, rentalIncome, royaltyIncome, trustIncome, capital gains (if tracked separately)

  let eligibleRetirementIncome = 0;
  eligibleRetirementIncome += privatePensionIncome;
  eligibleRetirementIncome += publicPensionIncome;
  eligibleRetirementIncome += (userInputs?.teacherPension || 0);
  eligibleRetirementIncome += (userInputs?.policePension || 0);
  eligibleRetirementIncome += (userInputs?.firefighterPension || 0);
  eligibleRetirementIncome += iraDistributions;
  eligibleRetirementIncome += (userInputs?.investmentIncome || 0);
  eligibleRetirementIncome += (userInputs?.rentalIncome || 0);
  eligibleRetirementIncome += (userInputs?.royaltyIncome || 0);
  eligibleRetirementIncome += (userInputs?.trustIncome || 0);
  // If you track capital gains separately, add here
  // eligibleRetirementIncome += (userInputs?.capitalGains || 0);

  // Military pension is excluded up to $25,000 per person age 60+
  let militaryExclusion = 0;
  if ((userInputs?.militaryRetirementPay || 0) > 0) {
    if (age >= 60) {
      militaryExclusion = Math.min(userInputs!.militaryRetirementPay, 25000);
    } else {
      // Under 60, treat as regular pension (already included above)
      militaryExclusion = 0;
    }
  }

  // Remove military pension from eligibleRetirementIncome if excluded
  let nonMilitaryEligibleIncome = eligibleRetirementIncome;
  if (militaryExclusion > 0) {
    nonMilitaryEligibleIncome -= militaryExclusion;
  }

  // Exclusion for age 60+: $12,500 per person (or total eligible income if less)
  // Under 60: $2,000 per person (or total eligible income if less)
  let exclusionPerPerson = age >= 60 ? 12500 : 2000;
  let numPeople = 1;
  const isMarried = filingStatus.toLowerCase().includes("married");
  if (isMarried && userInputs?.spouseAge !== undefined) {
    // If spouse age is provided, apply exclusion for spouse as well
    exclusionPerPerson += (userInputs.spouseAge >= 60 ? 12500 : 2000);
    numPeople = 2;
  }
  let totalExclusion = exclusionPerPerson;
  // If married and both ages are provided, use both exclusions
  if (isMarried && userInputs?.spouseAge !== undefined) {
    totalExclusion = (age >= 60 ? 12500 : 2000) + (userInputs.spouseAge >= 60 ? 12500 : 2000);
  }

  // Exclusion cannot exceed non-military eligible income
  const totalExclusionApplied = Math.min(nonMilitaryEligibleIncome, totalExclusion);

  // Taxable retirement income is non-military eligible income minus exclusion, plus any taxable military pension (if under 60)
  let taxableRetirementIncome = Math.max(0, nonMilitaryEligibleIncome - totalExclusionApplied);
  // Add back any military pension not excluded (for under 60)
  if (age < 60 && (userInputs?.militaryRetirementPay || 0) > 0) {
    taxableRetirementIncome += userInputs!.militaryRetirementPay;
  }

  // Delaware does not tax Social Security
  // Calculate tax using Delaware income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Georgia-specific retirement income tax calculation
function calculateGeorgiaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed in Georgia
  // Eligible retirement income: private/public/teacher/police/firefighter pensions, IRA, 401k, etc.
  let eligibleRetirementIncome = 0;
  eligibleRetirementIncome += privatePensionIncome;
  eligibleRetirementIncome += publicPensionIncome;
  eligibleRetirementIncome += (userInputs?.teacherPension || 0);
  eligibleRetirementIncome += (userInputs?.policePension || 0);
  eligibleRetirementIncome += (userInputs?.firefighterPension || 0);
  eligibleRetirementIncome += iraDistributions;

  // Under 62: special military retirement rule
  if (age < 62) {
    let militaryExclusion = 0;
    const militaryRetirement = userInputs?.militaryRetirementPay || 0;
    const nonRetirementIncome = userInputs?.annualIncome || 0;
    if (militaryRetirement > 0) {
      // Always exclude up to $17,500 of military retirement
      militaryExclusion = Math.min(militaryRetirement, 17500);
      // If non-retirement income is at least $17,500, exclude an additional $17,500
      if (nonRetirementIncome >= 17500) {
        const additionalExclusion = Math.min(militaryRetirement - militaryExclusion, 17500);
        militaryExclusion += additionalExclusion;
      }
    }
    // Taxable military retirement is whatever is left after exclusion
    let taxableMilitaryRetirement = Math.max(0, militaryRetirement - militaryExclusion);
    // All other retirement income is fully taxable under 62
    let taxableRetirementIncome = eligibleRetirementIncome + taxableMilitaryRetirement;
    return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
  }

  // Age 62-64: $35,000 exclusion for all eligible retirement income
  if (age >= 62 && age <= 64) {
    const exclusion = 35000;
    const taxableRetirementIncome = Math.max(0, eligibleRetirementIncome - exclusion);
    return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
  }

  // Age 65+: $65,000 exclusion for all eligible retirement income
  if (age >= 65) {
    const exclusion = 65000;
    const taxableRetirementIncome = Math.max(0, eligibleRetirementIncome - exclusion);
    return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
  }

  // Fallback: tax all eligible retirement income (should not be reached)
  return calculateIncomeTax(eligibleRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Hawaii-specific retirement income tax calculation
function calculateHawaiiRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed in Hawaii
  // Exempt: employer-funded pension plans (privatePensionIncome - employee portion), publicPensionIncome, militaryRetirementPay, teacher/police/firefighter pensions (if part of public system)
  // Taxable: IRA/401k withdrawals (iraDistributions) and employee-contributed portion of private pension

  // Employee-contributed portion of private pension (taxable)
  const employeePortion = userInputs?.privatePensionEmployeeContributionPortion
    ? Number(userInputs.privatePensionEmployeeContributionPortion)
    : 0;

  // Taxable: employee portion of private pension + IRA/401k withdrawals
  const taxableRetirementIncome = employeePortion + (iraDistributions || 0);

  // All other retirement income (investment, rental, royalty, trust, etc.) is taxed as regular income elsewhere
  // Only tax the taxableRetirementIncome here
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Hawaii-specific personal exemption calculation
function calculateHawaiiPersonalExemptions(
  stateData: StateTaxData,
  filingStatus: string,
  numDependents: number,
  age: number,
  spouseAge?: number
): number {
  const baseExemption = 1144; // Base personal exemption per person
  const additionalExemption65Plus = 1144; // Additional exemption for 65+
  
  let totalExemptions = 0;
  
  // Personal exemption for taxpayer
  totalExemptions += baseExemption;
  
  // Additional exemption if taxpayer is 65+
  if (age >= 65) {
    totalExemptions += additionalExemption65Plus;
  }
  
  // For married filing jointly, add spouse exemptions
  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("joint")) {
    totalExemptions += baseExemption; // Spouse base exemption
    
    // Additional exemption if spouse is 65+
    if (spouseAge && spouseAge >= 65) {
      totalExemptions += additionalExemption65Plus;
    }
  }
  
  // Dependent exemptions
  totalExemptions += numDependents * baseExemption;
  
  console.log(`Hawaii personal exemptions: Base (${baseExemption}) + Age 65+ bonus (${age >= 65 ? additionalExemption65Plus : 0}) + Spouse (${filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("joint") ? baseExemption : 0}) + Spouse 65+ (${spouseAge && spouseAge >= 65 ? additionalExemption65Plus : 0}) + Dependents (${numDependents} × ${baseExemption}) = ${totalExemptions}`);
  
  return totalExemptions;
}

// Idaho-specific retirement income tax calculation
function calculateIdahoRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed in Idaho
  // Military retirement: Only exempt if 65+ or 62+ and disabled
  // Idaho teacher, police, firefighter pensions: exempt
  // Out-of-state public pensions, private pensions, 401k/IRA: taxed at 5.695%

  const isMarried = filingStatus.toLowerCase().includes("married");
  const isDisabled = false; // If you have a disability flag, use it here
  let taxableRetirementIncome = 0;

  // Teacher, police, firefighter pensions from Idaho are exempt
  // (Assume all teacher/police/firefighter pensions are Idaho for now)
  // Out-of-state public pensions are taxed (for now, treat all publicPensionIncome as taxable)

  // Military retirement
  let militaryExempt = 0;
  let militaryTaxable = userInputs?.militaryRetirementPay || 0;
  if (
    (age >= 65) ||
    (age >= 62 && isDisabled)
  ) {
    // Exclude up to $45,864 (single) or $68,796 (married)
    const maxExclusion = isMarried ? 68796 : 45864;
    militaryExempt = Math.min(militaryTaxable, maxExclusion);
    militaryTaxable = Math.max(0, militaryTaxable - militaryExempt);
  }
  // Add taxable military retirement to taxable income
  taxableRetirementIncome += militaryTaxable;

  // Add all private pension, public pension, IRA/401k distributions (all taxable at 5.695%)
  taxableRetirementIncome += (userInputs?.privatePensionIncome || 0);
  taxableRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  taxableRetirementIncome += (userInputs?.iraDistributions || 0);

  // All other retirement income (investment, rental, royalty, trust, etc.) is taxed as regular income elsewhere
  // Only tax the taxableRetirementIncome here at 5.695%
  const idahoRetirementTaxRate = 0.05695;
  return taxableRetirementIncome * idahoRetirementTaxRate;
}

// Indiana-specific retirement income tax calculation
function calculateIndianaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and military retirement are NOT taxed
  // Pensions and IRA/401k are taxed at 3.05%
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += privatePensionIncome;
  taxableRetirementIncome += publicPensionIncome;
  taxableRetirementIncome += iraDistributions;
  // Do NOT include Social Security or military retirement

  // Calculate AGI for deduction eligibility
  const AGI =
    (userInputs?.annualIncome || 0) +
    privatePensionIncome +
    publicPensionIncome +
    iraDistributions;

  // $1,000 deduction for 65+, plus $500 if AGI < $40,000
  let deduction = 0;
  if (age >= 65) {
    deduction = 1000;
    if (AGI < 40000) {
      deduction += 500;
    }
  }
  taxableRetirementIncome = Math.max(0, taxableRetirementIncome - deduction);

  // Flat tax rate 3.05%
  return taxableRetirementIncome * 0.0305;
}

// Kansas-specific retirement income tax calculation
function calculateKansasRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed
  // Public pensions and military retirement are NOT taxed
  // Only private pensions and IRA/401k/annuities are taxed
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += privatePensionIncome;
  taxableRetirementIncome += iraDistributions;
  // Do NOT include publicPensionIncome or militaryRetirementPay
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Maine-specific retirement income tax calculation
function calculateMaineRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and military retirement are NOT taxed
  // Eligible: public/private pensions, IRA/401k/403b/457b/SIMPLE/SEP IRAs, teacher/police/firefighter/other gov pensions
  // Deduction: $45,864 per person, reduced by Social Security/railroad retirement benefits per person
  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;
  // Use Maine-specific deduction field if present, fallback to 45864
  const deductionCap = (stateData.retirementIncome as any)?.retirementIncomeDeduction || 45864;

  // Primary taxpayer
  let eligibleIncomePrimary =
    (privatePensionIncome || 0) +
    (publicPensionIncome || 0) +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);
  let deductionPrimary = deductionCap - (socialSecurityIncome || 0);
  deductionPrimary = Math.max(0, deductionPrimary);
  let taxablePrimary = Math.max(0, eligibleIncomePrimary - deductionPrimary);

  // Spouse (if married)
  let taxableSpouse = 0;
  if (isMarried && typeof spouseAge === "number") {
    // Assume spouse's eligible income is split proportionally (or user can enter separately in future)
    // For now, use same eligible income and Social Security as primary if not tracked separately
    let eligibleIncomeSpouse = 0;
    let spouseSocialSecurity = 0;
    // If you have spouse-specific fields, use them here. Otherwise, assume 0.
    // eligibleIncomeSpouse = userInputs?.spousePrivatePensionIncome + ...
    // spouseSocialSecurity = userInputs?.spouseSocialSecurityIncome
    // For now, assume 0 for spouse unless fields are added
    eligibleIncomeSpouse = 0;
    spouseSocialSecurity = 0;
    let deductionSpouse = deductionCap - spouseSocialSecurity;
    deductionSpouse = Math.max(0, deductionSpouse);
    taxableSpouse = Math.max(0, eligibleIncomeSpouse - deductionSpouse);
  }

  const totalTaxableRetirementIncome = taxablePrimary + taxableSpouse;
  return calculateIncomeTax(totalTaxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Calculate California Senior Head of Household Credit
function calculateCaliforniaSeniorCredit(userInputs: UserTaxInputs, totalTaxBurden: number): number {
  // Check if taxpayer qualifies for the credit
  const isEligible = 
    userInputs.age >= 65 && // Must be 65 or older
    userInputs.filingStatus.toLowerCase() === "head-of-household" && // Must file as Head of Household
    Number(userInputs.dependents) > 0; // Must have qualifying dependents

  if (!isEligible) {
    return 0;
  }

  // Calculate California AGI (simplified – using total income as proxy)
  const californiaAGI =
    (Number(userInputs.annualIncome) || 0) +
    (Number(userInputs.investmentIncome) || 0) +
    (Number(userInputs.rentalIncome) || 0) +
    (Number(userInputs.royaltyIncome) || 0) +
    (Number(userInputs.trustIncome) || 0) +
    (Number(userInputs.privatePensionIncome) || 0) +
    (Number(userInputs.teacherPension) || 0) +
    (Number(userInputs.policePension) || 0) +
    (Number(userInputs.firefighterPension) || 0) +
    (Number(userInputs.otherGovernmentPension) || 0) +
    (Number(userInputs.iraDistributions) || 0) +
    (Number(userInputs.militaryRetirementPay) || 0);

  // Maximum credit amount for 2024 (indexed for inflation)
  const maxCredit = 1748;

  // Phase-out threshold (approximately $92,719 for 2024)
  const phaseOutThreshold = 92719;

  // If AGI is at or above the phase-out threshold, no credit
  if (californiaAGI >= phaseOutThreshold) {
    return 0;
  }

  // Calculate phase-out reduction
  // Credit phases out linearly from $0 to $92,719
  const phaseOutRatio = californiaAGI / phaseOutThreshold;
  const credit = maxCredit * (1 - phaseOutRatio);

  // Credit cannot exceed the tax burden
  const finalCredit = Math.min(credit, totalTaxBurden);

  console.log("California Senior Head of Household Credit calculation:", {
    age: userInputs.age,
    filingStatus: userInputs.filingStatus,
    dependents: userInputs.dependents,
    californiaAGI,
    maxCredit,
    phaseOutThreshold,
    phaseOutRatio,
    calculatedCredit: credit,
    finalCredit,
  });

  return Math.max(0, finalCredit);
}

// Estimate property tax based on home value
function estimatePropertyTax(stateData: StateTaxData, homeValue: number): number {
  return homeValue * (stateData.propertyTax?.averageEffectiveRate / 100 || 0)
}

// Alabama-specific property tax calculation with homestead exemption
function calculateAlabamaPropertyTax(
  stateData: StateTaxData, 
  homeValue: number, 
  userInputs: UserTaxInputs
): number {
  console.log("ALABAMA PROPERTY TAX DEBUG:", {
    homeValue,
    homesteadType: userInputs.alHomesteadExemptionType,
    isDisabled: userInputs.alIsDisabled,
    isPrimaryResidence: userInputs.alIsPrimaryResidence,
    propertyAcres: userInputs.alPropertyAcres,
    age: userInputs.age,
    filingStatus: userInputs.filingStatus
  });

  // Check eligibility for homestead exemption
  const isEligible = 
    userInputs.alIsPrimaryResidence === true && 
    (userInputs.alPropertyAcres || 0) <= 160;

  if (!isEligible) {
    console.log("Alabama: Not eligible for homestead exemption - using standard calculation");
    return homeValue * (stateData.propertyTax?.averageEffectiveRate / 100 || 0);
  }

  // Calculate AGI for exemption type determination
  const alAGI = 
    (userInputs.annualIncome || 0) +
    (userInputs.investmentIncome || 0) +
    (userInputs.rentalIncome || 0) +
    (userInputs.royaltyIncome || 0) +
    (userInputs.trustIncome || 0) +
    (userInputs.privatePensionIncome || 0) +
    (userInputs.teacherPension || 0) +
    (userInputs.policePension || 0) +
    (userInputs.firefighterPension || 0) +
    (userInputs.otherGovernmentPension || 0) +
    (userInputs.militaryRetirementPay || 0) +
    (userInputs.iraDistributions || 0) +
    (userInputs.k401Distributions || 0) +
    (userInputs.annuityIncome || 0);

  // Determine exemption type if not provided
  let exemptionType = userInputs.alHomesteadExemptionType;
  if (!exemptionType) {
    const age = userInputs.age || 0;
    const isDisabled = userInputs.alIsDisabled || false;
    
    if (age >= 65) {
      if (isDisabled || alAGI <= 12000) {
        exemptionType = 'H-3'; // 100% exemption
      } else {
        exemptionType = 'H-2'; // Full state exemption, $5,000 county
      }
    } else {
      exemptionType = 'H-1'; // Standard exemption
    }
  }

  // Apply homestead exemption based on type
  let stateExemption = 0;
  let countyExemption = 0;

  switch (exemptionType) {
    case 'H-1': // Standard (under 65, not disabled)
      stateExemption = 4000;
      countyExemption = 2000;
      console.log("Alabama: H-1 exemption - $4,000 state, $2,000 county");
      break;
      
    case 'H-2': // Seniors 65+ with AGI ≥ $12,000
      stateExemption = homeValue; // Full state exemption (no cap)
      countyExemption = 5000;
      console.log("Alabama: H-2 exemption - Full state, $5,000 county");
      break;
      
    case 'H-3': // Seniors 65+ with AGI ≤ $12,000 OR permanently disabled
      stateExemption = homeValue; // 100% state exemption
      countyExemption = homeValue; // 100% county exemption
      console.log("Alabama: H-3 exemption - 100% state and county");
      break;
      
    case 'H-4': // Seniors 65+ with AGI > $12,000 (alternative to H-2)
      stateExemption = homeValue; // Full state exemption
      countyExemption = 2000;
      console.log("Alabama: H-4 exemption - Full state, $2,000 county");
      break;
      
    default:
      console.log("Alabama: No valid exemption type, using standard calculation");
      return homeValue * (stateData.propertyTax?.averageEffectiveRate / 100 || 0);
  }

  // Calculate taxable value after exemptions
  const stateTaxableValue = Math.max(0, homeValue - stateExemption);
  const countyTaxableValue = Math.max(0, homeValue - countyExemption);

  // Apply tax rates (assuming state and county rates are combined in averageEffectiveRate)
  // For simplicity, we'll apply the exemption proportionally to the total rate
  const totalRate = stateData.propertyTax?.averageEffectiveRate / 100 || 0;
  
  // Assume 60% state, 40% county split (this may need adjustment based on actual Alabama rates)
  const stateRate = totalRate * 0.6;
  const countyRate = totalRate * 0.4;
  
  const stateTax = stateTaxableValue * stateRate;
  const countyTax = countyTaxableValue * countyRate;
  const totalTax = stateTax + countyTax;

  console.log("Alabama property tax calculation:", {
    homeValue,
    exemptionType,
    stateExemption,
    countyExemption,
    stateTaxableValue,
    countyTaxableValue,
    stateTax,
    countyTax,
    totalTax
  });

  return totalTax;
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

// Calculate New Hampshire interest & dividends tax
function calculateNewHampshireInterestDividendsTax(
  stateData: StateTaxData,
  userInputs: UserTaxInputs
): number {
  const interest = userInputs.interestIncome || 0;
  const dividends = userInputs.dividendsIncome || 0;
  const total = interest + dividends;
  const filingStatus = userInputs.filingStatus.toLowerCase();
  const isMarried = filingStatus.includes("married");
  const threshold = isMarried ? 4800 : 2400;
  const taxable = Math.max(0, total - threshold);
  const rate = (stateData.retirementIncome as any)?.interestAndDividendsRate || 2;
  if (taxable <= 0) return 0;
  return taxable * (rate / 100);
}

// New Jersey-specific retirement income tax calculation
function calculateNewJerseyRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security, Railroad, and Military pensions are fully exempt
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  const isMarried = filingStatus.toLowerCase().includes("married");
  const isMarriedSeparate = filingStatus.toLowerCase().includes("separate");
  const isDisabled = false; // Add disability logic if available
  const spouseAge = userInputs?.spouseAge;

  // Only apply exclusion if 62+ or disabled
  const qualifiesByAge = age >= ((stateData.retirementIncome as any)?.retirementIncomeExclusionAge || 62);
  // If you have spouse logic, can check spouseAge >= 62 for joint
  const qualifies = qualifiesByAge || isDisabled;

  // Calculate NJ AGI (all income except Social Security, Railroad, Military)
  const agi =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    privatePensionIncome +
    publicPensionIncome +
    iraDistributions +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Qualifying retirement income (pensions, IRA, 401k, annuity, Keogh, SEP)
  let qualifyingRetirementIncome =
    privatePensionIncome +
    publicPensionIncome +
    iraDistributions +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Exclusion amounts
  let maxExclusion = 0;
  if (isMarriedSeparate) {
    maxExclusion = (stateData.retirementIncome as any)?.retirementIncomeExclusion?.marriedSeparate || 50000;
  } else if (isMarried) {
    maxExclusion = (stateData.retirementIncome as any)?.retirementIncomeExclusion?.married || 100000;
  } else {
    maxExclusion = (stateData.retirementIncome as any)?.retirementIncomeExclusion?.single || 75000;
  }

  let exclusion = 0;
  if (qualifies && agi <= ((stateData.retirementIncome as any)?.retirementIncomeExclusionAgiLimit || 150000)) {
    if (agi <= ((stateData.retirementIncome as any)?.retirementIncomeExclusionPhaseoutStart || 100000)) {
      exclusion = maxExclusion;
    } else {
      // Phase-out: $1 reduction per $1 over $100k
      const over = agi - ((stateData.retirementIncome as any)?.retirementIncomeExclusionPhaseoutStart || 100000);
      exclusion = Math.max(0, maxExclusion - over);
    }
  }

  // Social Security, Railroad, and Military pensions are fully exempt
  // Remove them from qualifyingRetirementIncome if present
  // (Assume not included in the above sum, but double check)

  // Taxable retirement income is qualifying income minus exclusion
  const taxableRetirementIncome = Math.max(0, qualifyingRetirementIncome - exclusion);

  // Calculate tax using NJ income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// New Mexico-specific retirement income tax calculation
function calculateNewMexicoRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  const isMarried = filingStatus.toLowerCase().includes("married");
  const agi =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    privatePensionIncome +
    publicPensionIncome +
    iraDistributions +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Social Security deduction/exemption
  let socialSecurityDeduction = 0;
  if (age >= 65) {
    if ((isMarried && agi <= ((stateData.retirementIncome as any)?.socialSecurityExemption65PlusAgiMarried || 150000)) ||
        (!isMarried && agi <= ((stateData.retirementIncome as any)?.socialSecurityExemption65PlusAgiSingle || 100000))) {
      socialSecurityDeduction = socialSecurityIncome; // Fully exempt
    } else if ((isMarried && agi <= ((stateData.retirementIncome as any)?.socialSecurityDeduction65PlusAgiMarried || 51000)) ||
               (!isMarried && agi <= ((stateData.retirementIncome as any)?.socialSecurityDeduction65PlusAgiSingle || 28500))) {
      socialSecurityDeduction = Math.min(socialSecurityIncome, (stateData.retirementIncome as any)?.socialSecurityDeduction65Plus || 8000);
    }
  } else {
    if ((isMarried && agi <= ((stateData.retirementIncome as any)?.socialSecurityDeductionUnder65AgiMarried || 55000)) ||
        (!isMarried && agi <= ((stateData.retirementIncome as any)?.socialSecurityDeductionUnder65AgiSingle || 36667))) {
      socialSecurityDeduction = Math.min(socialSecurityIncome, (stateData.retirementIncome as any)?.socialSecurityDeductionUnder65 || 2500);
    }
  }
  const taxableSocialSecurity = Math.max(0, socialSecurityIncome - socialSecurityDeduction);

  // Military retirement exemption
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  const militaryExemption = Math.min(militaryRetirement, (stateData.retirementIncome as any)?.militaryRetirementExemption || 30000);
  const taxableMilitaryRetirement = Math.max(0, militaryRetirement - militaryExemption);

  // Retirement income deduction (pensions, IRA, 401k, annuities)
  let retirementDeduction = 0;
  if (age >= 65) {
    if ((isMarried && agi <= ((stateData.retirementIncome as any)?.retirementIncomeDeduction65PlusAgiMarried || 51000)) ||
        (!isMarried && agi <= ((stateData.retirementIncome as any)?.retirementIncomeDeduction65PlusAgiSingle || 28500))) {
      retirementDeduction = (stateData.retirementIncome as any)?.retirementIncomeDeduction65Plus || 8000;
    }
  } else {
    if ((isMarried && agi <= ((stateData.retirementIncome as any)?.retirementIncomeDeductionUnder65AgiMarried || 55000)) ||
        (!isMarried && agi <= ((stateData.retirementIncome as any)?.retirementIncomeDeductionUnder65AgiSingle || 36667))) {
      retirementDeduction = (stateData.retirementIncome as any)?.retirementIncomeDeductionUnder65 || 2500;
    }
  }

  // Taxable retirement income (pensions, IRA, 401k, annuities, teacher/police/firefighter pensions)
  let taxableRetirementIncome =
    privatePensionIncome +
    publicPensionIncome +
    iraDistributions +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  taxableRetirementIncome = Math.max(0, taxableRetirementIncome - retirementDeduction);

  // Add taxable Social Security and taxable military retirement
  taxableRetirementIncome += taxableSocialSecurity + taxableMilitaryRetirement;

  // TODO: SB114 for non-Social Security-covered public pensions

  // Calculate tax using NM income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// New York-specific retirement income tax calculation
function calculateNewYorkRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;
  // Social Security is fully exempt
  // Public pensions (NY state/local, federal, military) are fully exempt
  const publicPensionTotal =
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    publicPensionIncome;

  // Private pensions, IRAs, 401k, annuities
  let privateRetirementTotal =
    (privatePensionIncome || 0) +
    (iraDistributions || 0) +
    (userInputs?.k401Distributions || 0);

  // Pension/annuity subtraction: $20,000 per person 59.5+
  let subtraction = 0;
  if (isMarried && spouseAge && age >= 59.5 && spouseAge >= 59.5) {
    subtraction = (stateData.retirementIncome as any)?.pensionAnnuitySubtractionJoint || 40000;
  } else if (age >= 59.5) {
    subtraction = (stateData.retirementIncome as any)?.pensionAnnuitySubtraction || 20000;
  }
  // If spouse is 59.5+ but primary is not, allow $20k subtraction (for spouse only)
  else if (isMarried && spouseAge && spouseAge >= 59.5) {
    subtraction = (stateData.retirementIncome as any)?.pensionAnnuitySubtraction || 20000;
  }

  // Apply subtraction to private retirement total
  const taxablePrivateRetirement = Math.max(0, privateRetirementTotal - subtraction);

  // Taxable retirement income is just the taxable private retirement (public and SS are exempt)
  return calculateIncomeTax(taxablePrivateRetirement, stateData.incomeTax.brackets, filingStatus);
}

// North Carolina-specific retirement income tax calculation
function calculateNorthCarolinaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and railroad retirement are fully exempt
  // Public pensions: exempt if Bailey-exempt, otherwise taxable
  // Federal/military/railroad pensions: always exempt
  // Private pensions, IRAs, 401k, annuities: fully taxable at flat NC rate
  const baileyExempt = userInputs?.ncBaileyExemption === true;
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  const railroadRetirement = 0; // Add field if needed

  // Public pensions: teacher, police, firefighter, other government
  let publicPensionTotal =
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Exempt public pensions if Bailey-exempt
  let taxablePublicPension = baileyExempt ? 0 : publicPensionTotal;

  // Private pensions, IRAs, 401k
  let taxablePrivateRetirement =
    (privatePensionIncome || 0) +
    (iraDistributions || 0) +
    (userInputs?.k401Distributions || 0);

  // Flat NC tax rate (use 4.5% for now, could use year-based logic)
  const ncFlatRate = (stateData.retirementIncome as any)?.flatTaxRate2024 || 0.045;

  // Total taxable retirement income
  const totalTaxableRetirement = taxablePublicPension + taxablePrivateRetirement;

  return totalTaxableRetirement * ncFlatRate;
}

// North Dakota-specific retirement income tax calculation
function calculateNorthDakotaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and military retirement are fully exempt
  // TODO: Peace officer/firefighter pension exclusion (user input)
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  // Police/firefighter/teacher/other gov pensions
  const publicPensionTotal =
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);
  // For now, always taxable (TODO: add peace officer exclusion logic)
  // All other retirement income
  let taxableRetirementIncome =
    privatePensionIncome +
    publicPensionTotal +
    iraDistributions +
    (userInputs?.k401Distributions || 0);
  // Exclude Social Security and military retirement
  // (do not add socialSecurityIncome or militaryRetirement)
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Ohio-specific retirement income tax calculation
function calculateOhioRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  k401Distributions: number,
  annuityIncome: number,
  militaryRetirementPay: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security, Railroad, and Military pensions are fully exempt
  // All other retirement income (pensions, IRAs, 401k, annuities) is fully taxable
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += (privatePensionIncome || 0);
  taxableRetirementIncome += (publicPensionIncome || 0);
  taxableRetirementIncome += (iraDistributions || 0);
  taxableRetirementIncome += (k401Distributions || 0);
  taxableRetirementIncome += (annuityIncome || 0);
  // Do NOT include Social Security, Railroad, or Military retirement
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Oklahoma-specific retirement income tax calculation
function calculateOklahomaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed
  // Military retirement is NOT taxed
  // Public pensions (teacher, police, fire, civil service) exempt up to $10,000 per person
  // Private pensions, IRA, 401k, annuities exempt up to $10,000 per person if age 65+
  // Amounts above exemption are taxed at state income tax rates

  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;
  let exemptionPerPerson = 10000;
  let publicPension =
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);
  let privatePension = privatePensionIncome;
  let ira401k = iraDistributions + (userInputs?.k401Distributions || 0) + (userInputs?.annuityIncome || 0);
  let militaryRetirement = userInputs?.militaryRetirementPay || 0;

  // Exempt all military retirement
  // Exempt all Social Security

  // Public pension exemption
  let publicPensionExemption = exemptionPerPerson;
  let privatePensionExemption = 0;
  if (isMarried && spouseAge !== undefined) {
    publicPensionExemption *= 2;
  }
  let taxablePublicPension = Math.max(0, publicPension - publicPensionExemption);

  // Private pension/IRA/401k/annuities exemption (only if age 65+ per person)
  let eligiblePrivateExemption = 0;
  if (age >= 65) eligiblePrivateExemption += exemptionPerPerson;
  if (isMarried && spouseAge !== undefined && spouseAge >= 65) eligiblePrivateExemption += exemptionPerPerson;
  privatePensionExemption = eligiblePrivateExemption;
  let totalPrivate = privatePension + ira401k;
  let taxablePrivate = Math.max(0, totalPrivate - privatePensionExemption);

  // Taxable retirement income is taxablePublicPension + taxablePrivate
  let taxableRetirementIncome = taxablePublicPension + taxablePrivate;

  // Tax at Oklahoma income tax rates
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Oregon-specific retirement income tax calculation
function calculateOregonRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and Railroad Retirement are NOT taxed
  // All pensions and retirement plan distributions are taxed as ordinary income
  // Exception: Federal-service pensions pre-Oct 1991 may qualify for subtraction (not implemented)

  // Sum all taxable retirement income (exclude Social Security)
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += privatePensionIncome;
  taxableRetirementIncome += publicPensionIncome;
  taxableRetirementIncome += iraDistributions;
  taxableRetirementIncome += (userInputs?.k401Distributions || 0);
  taxableRetirementIncome += (userInputs?.annuityIncome || 0);
  taxableRetirementIncome += (userInputs?.teacherPension || 0);
  taxableRetirementIncome += (userInputs?.policePension || 0);
  taxableRetirementIncome += (userInputs?.firefighterPension || 0);
  taxableRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  taxableRetirementIncome += (userInputs?.militaryRetirementPay || 0);

  // TODO: Federal-service pension subtraction for pre-Oct 1991 service (not implemented)

  // Calculate base tax
  let baseTax = calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);

  // Oregon Retirement Income Credit (official logic)
  let credit = 0;
  const isMarried = filingStatus.toLowerCase().includes("married");
  const base = isMarried ? 15000 : 7500;
  const householdIncomeLimit = isMarried ? 30000 : 15000;

  // Calculate household income (exclude all Social Security)
  const householdIncome =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    taxableRetirementIncome;

  // Social Security (taxable + nontaxable)
  const socialSecurity = (userInputs?.socialSecurityIncome || 0);

  // Reduce base by Social Security and by excess household income
  let reducedBase = base - socialSecurity;
  if (householdIncome > householdIncomeLimit) {
    reducedBase -= (householdIncome - householdIncomeLimit);
  }
  reducedBase = Math.max(0, reducedBase);

  // Credit is 9% of the lesser of (a) total retirement income, or (b) reduced base
  credit = 0.09 * Math.min(taxableRetirementIncome, reducedBase);

  // Final tax after credit, but credit cannot exceed tax liability
  return Math.max(0, baseTax - Math.min(baseTax, credit));
}

// Pennsylvania-specific retirement income tax calculation
function calculatePennsylvaniaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and Railroad Retirement are NOT taxed
  // All public and private pension income, 401(k), and IRA distributions are fully exempt for age 60+
  // Distributions before age 59.5 are taxable
  // Military retirement and disability pay are always fully exempt

  // If age >= 60, all retirement income is exempt
  if (age >= 60) {
    return 0;
  }

  // If under 59.5, distributions are taxable (except military/disability)
  let taxableRetirementIncome = 0;

  // Only count distributions if under 59.5
  if (age < 59.5) {
    // Pensions and retirement accounts (private, public, IRA, 401k, etc.)
    taxableRetirementIncome += privatePensionIncome;
    taxableRetirementIncome += publicPensionIncome;
    taxableRetirementIncome += iraDistributions;
    taxableRetirementIncome += (userInputs?.k401Distributions || 0);
    taxableRetirementIncome += (userInputs?.annuityIncome || 0);
    taxableRetirementIncome += (userInputs?.teacherPension || 0);
    taxableRetirementIncome += (userInputs?.policePension || 0);
    taxableRetirementIncome += (userInputs?.firefighterPension || 0);
    taxableRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  }

  // Military retirement and disability pay are always exempt
  // (Do not add userInputs?.militaryRetirementPay or any disability pay fields)

  // PA has a flat income tax rate, but retirement income is not subject to it if age 60+
  // Use state income tax brackets for any taxable amount (should be rare)
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Rhode Island-specific retirement income tax calculation
function calculateRhodeIslandRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is taxable unless AGI is below threshold and at full retirement age
  // Pension & Annuity Subtraction: If at full retirement age and AGI is below threshold, exclude up to $20,000 ($40,000 joint) of qualifying pension/annuity income

  const isMarried = filingStatus.toLowerCase().includes("married");
  // AGI thresholds for Social Security exemption
  const ssAgiLimit = isMarried ? 126250 : 101000;
  // AGI thresholds for pension/annuity subtraction
  const pensionAgiLimit = isMarried ? 130250 : 104200;
  // Pension/annuity subtraction amount
  const pensionSubtraction = isMarried ? 40000 : 20000;

  // Calculate federal AGI (approximate: sum all income except Social Security)
  const federalAGI =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    (userInputs?.privatePensionIncome || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.annuityIncome || 0) +
    (userInputs?.iraDistributions || 0);

  // Social Security taxation
  let taxableSocialSecurity = socialSecurityIncome;
  // Assume full retirement age is 67 (SSA-defined, could be improved with user input)
  const fullRetirementAge = 67;
  if (age >= fullRetirementAge && federalAGI <= ssAgiLimit) {
    taxableSocialSecurity = 0;
  }

  // Qualifying pension/annuity income for subtraction (public/private pensions, 401k, 403b, annuities, military retirement)
  let qualifyingPension =
    (userInputs?.privatePensionIncome || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.annuityIncome || 0);
  // IRAs, SEP/SIMPLE, and Social Security are NOT included in the subtraction

  // Apply pension/annuity subtraction if eligible
  let pensionExclusion = 0;
  if (age >= fullRetirementAge && federalAGI <= pensionAgiLimit) {
    pensionExclusion = Math.min(qualifyingPension, pensionSubtraction);
  }

  // Taxable retirement income
  let taxableRetirementIncome = 0;
  // Add taxable Social Security
  taxableRetirementIncome += taxableSocialSecurity;
  // Add all pension/annuity/IRA/SEP/SIMPLE/other distributions
  // (subtract pensionExclusion from qualifying pension/annuity income)
  taxableRetirementIncome += Math.max(0, qualifyingPension - pensionExclusion);
  // Add IRA/SEP/SIMPLE distributions (not eligible for subtraction)
  taxableRetirementIncome += (userInputs?.iraDistributions || 0);

  // Calculate tax using RI income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// South Carolina-specific retirement income tax calculation
function calculateSouthCarolinaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and Railroad Retirement are NOT taxed
  // Military retirement pay is 100% exempt
  // Retirement Income Deduction: Under 65, deduct up to $3,000; 65+, up to $10,000 per person
  // Age 65+ Special Deduction: Additional $15,000, reduced by retirement deduction already claimed (max $15,000 per person)
  // Expanded Pension Deduction: Full deduction of all police, fire, and teacher pension income for eligible first responders/teachers

  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;

  // Exclude Social Security and Railroad Retirement
  // (Assume all socialSecurityIncome is exempt)

  // Exclude all military retirement pay
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;

  // Expanded Pension Deduction for first responders/teachers (assume eligible if any present)
  const teacherPension = userInputs?.teacherPension || 0;
  const policePension = userInputs?.policePension || 0;
  const firefighterPension = userInputs?.firefighterPension || 0;
  const totalFirstResponderPension = teacherPension + policePension + firefighterPension;
  let firstResponderDeduction = totalFirstResponderPension;

  // Standard retirement income (private, public, IRA, 401k, annuities, other gov)
  let otherRetirementIncome =
    (privatePensionIncome || 0) +
    (publicPensionIncome || 0) +
    (iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.annuityIncome || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Remove first responder/teacher pension from otherRetirementIncome (so it's not double-counted)
  otherRetirementIncome -= totalFirstResponderPension;
  otherRetirementIncome = Math.max(0, otherRetirementIncome);

  // Retirement Income Deduction
  let retirementDeduction = 0;
  let specialDeduction = 0;
  if (age >= 65) {
    retirementDeduction = 10000;
    // Age 65+ Special Deduction: $15,000 minus any retirement deduction already claimed
    specialDeduction = 15000 - retirementDeduction;
    if (specialDeduction < 0) specialDeduction = 0;
    // For married, double both deductions if spouse is 65+
    if (isMarried && spouseAge && spouseAge >= 65) {
      retirementDeduction += 10000;
      specialDeduction += 15000 - 10000;
    }
  } else {
    retirementDeduction = 3000;
    // For married, double deduction if spouse is also under 65
    if (isMarried && spouseAge && spouseAge < 65) {
      retirementDeduction += 3000;
    }
  }

  // Total deduction for standard retirement income (cannot exceed income)
  let totalRetirementDeduction = Math.min(otherRetirementIncome, retirementDeduction + specialDeduction);

  // Taxable retirement income: otherRetirementIncome minus deduction, plus any IRA/401k/annuity not covered, plus any first responder/teacher pension not covered by deduction (should be zero if eligible)
  let taxableRetirementIncome = Math.max(0, otherRetirementIncome - totalRetirementDeduction);
  // First responder/teacher pension is fully deductible if eligible
  taxableRetirementIncome += Math.max(0, totalFirstResponderPension - firstResponderDeduction);
  // Military retirement is fully exempt (not included)

  // Calculate tax using SC income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Utah-specific retirement income tax calculation
function calculateUtahRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("UTAH RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;

  // Calculate Utah AGI (simplified - using total income as proxy)
  const utahAGI = 
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    socialSecurityIncome +
    privatePensionIncome +
    publicPensionIncome +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.annuityIncome || 0);

  // 1. Social Security is fully taxable in Utah
  let taxableSocialSecurity = socialSecurityIncome;

  // 2. Calculate Social Security Benefits Credit
  let socialSecurityCredit = 0;
  if (socialSecurityIncome > 0) {
    // Calculate the Utah tax on Social Security benefits
    const socialSecurityTax = calculateIncomeTax(socialSecurityIncome, stateData.incomeTax.brackets, filingStatus);
    
    // Determine AGI thresholds for credit
    const agiThreshold = isMarried ? 75000 : 45000;
    const phaseOutThreshold = isMarried ? 95000 : 55000;
    
    if (utahAGI <= agiThreshold) {
      // Full credit up to the amount of Utah tax on Social Security
      socialSecurityCredit = socialSecurityTax;
      console.log("Utah: Full Social Security credit applied:", socialSecurityCredit);
    } else if (utahAGI <= phaseOutThreshold) {
      // Credit phases out at 2.5 cents per dollar above threshold
      const excess = utahAGI - agiThreshold;
      const phaseOutReduction = excess * 0.025;
      socialSecurityCredit = Math.max(0, socialSecurityTax - phaseOutReduction);
      console.log("Utah: Partial Social Security credit applied:", socialSecurityCredit, "phase-out reduction:", phaseOutReduction);
    } else {
      // Credit fully phased out
      socialSecurityCredit = 0;
      console.log("Utah: Social Security credit fully phased out");
    }
  }

  // 3. Calculate total retirement income (excluding Social Security for now)
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += (userInputs?.teacherPension || 0);
  totalRetirementIncome += (userInputs?.policePension || 0);
  totalRetirementIncome += (userInputs?.firefighterPension || 0);
  totalRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  totalRetirementIncome += (userInputs?.iraDistributions || 0);
  totalRetirementIncome += (userInputs?.k401Distributions || 0);
  totalRetirementIncome += (userInputs?.annuityIncome || 0);
  totalRetirementIncome += (userInputs?.militaryRetirementPay || 0);

  // 4. Calculate Retirement Income Credit
  let retirementIncomeCredit = 0;
  if (totalRetirementIncome > 0) {
    // Determine income limits for retirement income credit
    let incomeLimit = 0;
    if (filingStatus.toLowerCase().includes("separate")) {
      incomeLimit = 25000; // Married filing separately
    } else if (isMarried) {
      incomeLimit = 50000; // Married filing jointly
    } else {
      incomeLimit = 30000; // Single
    }

    if (utahAGI <= incomeLimit) {
      // Calculate credit: up to $450 per person (max $900 joint)
      let creditPerPerson = 450;
      let totalCredit = creditPerPerson;
      
      if (isMarried && spouseAge !== undefined) {
        totalCredit = creditPerPerson * 2; // $900 for married couples
      }
      
      retirementIncomeCredit = Math.min(totalCredit, totalRetirementIncome * 0.0455); // Cap at Utah tax rate
      console.log("Utah: Retirement income credit applied:", retirementIncomeCredit);
    } else {
      console.log("Utah: AGI exceeds limit for retirement income credit");
    }
  }

  // 5. Calculate Military Retirement Credit
  let militaryRetirementCredit = 0;
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  if (militaryRetirement > 0) {
    // Military retirement credit = taxable military retirement × 4.55%
    militaryRetirementCredit = militaryRetirement * 0.0455;
    console.log("Utah: Military retirement credit calculated:", militaryRetirementCredit);
  }

  // 6. Calculate total taxable retirement income
  let taxableRetirementIncome = 0;
  
  // All retirement income is taxable at 4.55%
  taxableRetirementIncome += socialSecurityIncome; // Social Security is taxable
  taxableRetirementIncome += totalRetirementIncome; // All other retirement income

  // 7. Calculate base tax on retirement income
  const baseRetirementTax = calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);

  // 8. Apply credits (choose the most beneficial)
  // Note: You cannot claim both Social Security credit and Retirement Income credit
  // For military retirement, you cannot claim both Social Security/military credit with Retirement Income credit
  // TODO: double check UT military and social security
  let totalCredits = 0;
  
  if (militaryRetirement > 0) {
    // If military retirement present, use military credit + Social Security credit (if applicable)
    totalCredits = militaryRetirementCredit + socialSecurityCredit;
    console.log("Utah: Using military credit + Social Security credit:", totalCredits);
  } else if (socialSecurityIncome > 0 && totalRetirementIncome > 0) {
    // If both Social Security and other retirement income, choose the more beneficial credit
    const socialSecurityOption = socialSecurityCredit;
    const retirementIncomeOption = retirementIncomeCredit;
    
    if (socialSecurityOption > retirementIncomeOption) {
      totalCredits = socialSecurityOption;
      console.log("Utah: Using Social Security credit (more beneficial):", totalCredits);
    } else {
      totalCredits = retirementIncomeOption;
      console.log("Utah: Using Retirement Income credit (more beneficial):", totalCredits);
    }
  } else if (socialSecurityIncome > 0) {
    // Only Social Security income
    totalCredits = socialSecurityCredit;
    console.log("Utah: Using Social Security credit only:", totalCredits);
  } else if (totalRetirementIncome > 0) {
    // Only other retirement income
    totalCredits = retirementIncomeCredit;
    console.log("Utah: Using Retirement Income credit only:", totalCredits);
  }

  // 9. Calculate final tax
  const finalTax = Math.max(0, baseRetirementTax - totalCredits);

  console.log("Utah retirement tax calculation:", {
    utahAGI,
    socialSecurityIncome,
    taxableSocialSecurity,
    totalRetirementIncome,
    baseRetirementTax,
    socialSecurityCredit,
    retirementIncomeCredit,
    militaryRetirementCredit,
    totalCredits,
    finalTax,
  });

  return finalTax;
}

// Vermont-specific retirement income tax calculation
function calculateVermontRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("VERMONT RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  const isMarried = filingStatus.toLowerCase().includes("married");
  const isMarriedSeparate = filingStatus.toLowerCase().includes("separate");
  const isHeadOfHousehold = filingStatus.toLowerCase().includes("head");

  // Calculate Vermont AGI (simplified - using total income as proxy)
  const vermontAGI = 
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    socialSecurityIncome +
    privatePensionIncome +
    publicPensionIncome +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.annuityIncome || 0);

  // 1. Social Security Taxation with Vermont's tiered exemption system
  let taxableSocialSecurity = 0;
  
  if (socialSecurityIncome > 0) {
    // First, determine the federally-taxable portion of Social Security
    // For simplicity, we'll use the full amount, but in practice this would be
    // the federally-taxable portion from the user's federal return
    const federallyTaxableSS = socialSecurityIncome; // This should come from federal calculation
    
    // Determine AGI thresholds based on filing status
    let fullExemptionThreshold = 0;
    let upperBandLimit = 0;
    let bandWidth = 0;
    
    if (isMarried && !isMarriedSeparate) {
      // Married filing jointly
      fullExemptionThreshold = 65000;
      upperBandLimit = 75000;
      bandWidth = 10000;
    } else {
      // Single, Head of Household, or Married Filing Separately
      fullExemptionThreshold = 50000;
      upperBandLimit = 60000;
      bandWidth = 10000;
    }
    
    // Calculate Vermont Social Security exclusion
    let vermontSSExclusion = 0;
    
    if (vermontAGI <= fullExemptionThreshold) {
      // Full exemption - no Social Security tax
      vermontSSExclusion = federallyTaxableSS;
      console.log("Vermont: Full Social Security exemption applied:", vermontSSExclusion);
    } else if (vermontAGI <= upperBandLimit) {
      // Phase-out band - partial exclusion using straight-line formula
      const exclusionRatio = (upperBandLimit - vermontAGI) / bandWidth;
      vermontSSExclusion = federallyTaxableSS * exclusionRatio;
      console.log("Vermont: Partial Social Security exclusion applied:", vermontSSExclusion, "ratio:", exclusionRatio);
    } else {
      // Above upper band - no exclusion
      vermontSSExclusion = 0;
      console.log("Vermont: No Social Security exclusion (AGI above upper band)");
    }
    
    // Calculate taxable Social Security
    taxableSocialSecurity = Math.max(0, federallyTaxableSS - vermontSSExclusion);
    console.log("Vermont: Taxable Social Security:", taxableSocialSecurity);
  }

  // 2. Calculate total retirement income (excluding Social Security for pension deduction)
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += (userInputs?.teacherPension || 0);
  totalRetirementIncome += (userInputs?.policePension || 0);
  totalRetirementIncome += (userInputs?.firefighterPension || 0);
  totalRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  totalRetirementIncome += (userInputs?.iraDistributions || 0);
  totalRetirementIncome += (userInputs?.k401Distributions || 0);
  totalRetirementIncome += (userInputs?.annuityIncome || 0);
  totalRetirementIncome += (userInputs?.militaryRetirementPay || 0);

  // 3. Apply $10,000 pension/annuity deduction with AGI-based phase-out
  let pensionDeduction = 0;
  if (totalRetirementIncome > 0) {
    // Determine AGI thresholds for pension deduction (same as Social Security)
    let fullDeductionThreshold = 0;
    let upperBandLimit = 0;
    let bandWidth = 0;
    
    if (isMarried && !isMarriedSeparate) {
      // Married filing jointly
      fullDeductionThreshold = 65000;
      upperBandLimit = 75000;
      bandWidth = 10000;
    } else {
      // Single, Head of Household, or Married Filing Separately
      fullDeductionThreshold = 50000;
      upperBandLimit = 60000;
      bandWidth = 10000;
    }
    
    // Calculate pension deduction based on AGI
    if (vermontAGI <= fullDeductionThreshold) {
      // Full deduction
      pensionDeduction = Math.min(10000, totalRetirementIncome);
      console.log("Vermont: Full pension deduction applied:", pensionDeduction);
    } else if (vermontAGI <= upperBandLimit) {
      // Partial deduction using straight-line formula
      const deductionRatio = (upperBandLimit - vermontAGI) / bandWidth;
      const maxDeduction = Math.min(10000, totalRetirementIncome);
      pensionDeduction = maxDeduction * deductionRatio;
      console.log("Vermont: Partial pension deduction applied:", pensionDeduction, "ratio:", deductionRatio);
    } else {
      // No deduction - AGI above upper band
      pensionDeduction = 0;
      console.log("Vermont: No pension deduction (AGI above upper band)");
    }
  }

  // 4. Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  
  // Add taxable Social Security
  taxableRetirementIncome += taxableSocialSecurity;
  
  // Add other retirement income minus pension deduction
  taxableRetirementIncome += Math.max(0, totalRetirementIncome - pensionDeduction);

  console.log("Vermont retirement tax calculation:", {
    vermontAGI,
    socialSecurityIncome,
    taxableSocialSecurity,
    totalRetirementIncome,
    pensionDeduction,
    taxableRetirementIncome,
  });

  // 5. Calculate tax using Vermont income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Virginia-specific retirement income tax calculation
function calculateVirginiaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("VIRGINIA RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  // 1. Social Security & Tier 1 Railroad: fully exempt
  // If any portion was taxed federally, subtract it from VA taxable income
  // For now, assume all Social Security is exempt
  const taxableSocialSecurity = 0;

  // 2. Calculate AGI (sum of all income fields)
  const vaAGI =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    (userInputs?.privatePensionIncome || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.annuityIncome || 0);

  // 3. Military retirement subtraction
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  const militarySubtraction = Math.min(40000, militaryRetirement);

  // 4. Pensions/IRAs/401k/Annuities: taxable, but age-based deduction
  // Determine birth year (assume current year is 2024)
  const birthYear = 2024 - age;
  let ageDeduction = 0;
  let deductionPhaseout = 0;
  let deductionLimit = 0;
  let phaseoutThreshold = 0;
  let isMarried = filingStatus.toLowerCase().includes("married");

  if (birthYear <= 1939) {
    // Born Jan 1, 1939 or earlier: flat $12,000 deduction
    ageDeduction = 12000;
  } else if (birthYear > 1939 && birthYear <= 1960 && age >= 65) {
    // Born Jan 2, 1939–Jan 1, 1960: up to $12,000, phased out if AGI > $50k/$75k
    ageDeduction = 12000;
    phaseoutThreshold = isMarried ? 75000 : 50000;
    if (vaAGI > phaseoutThreshold) {
      deductionPhaseout = vaAGI - phaseoutThreshold;
      ageDeduction = Math.max(0, ageDeduction - deductionPhaseout);
    }
  }
  // If not 65+ or not in birth year range, no deduction

  // 5. Calculate total retirement income (excluding Social Security)
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += (userInputs?.teacherPension || 0);
  totalRetirementIncome += (userInputs?.policePension || 0);
  totalRetirementIncome += (userInputs?.firefighterPension || 0);
  totalRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  totalRetirementIncome += (userInputs?.iraDistributions || 0);
  totalRetirementIncome += (userInputs?.k401Distributions || 0);
  totalRetirementIncome += (userInputs?.annuityIncome || 0);
  // Subtract military retirement (handled separately)
  totalRetirementIncome -= militaryRetirement;
  totalRetirementIncome = Math.max(0, totalRetirementIncome);

  // 6. Apply age-based deduction (cannot exceed total retirement income)
  const ageDeductionApplied = Math.min(ageDeduction, totalRetirementIncome);

  // 7. Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += totalRetirementIncome - ageDeductionApplied;
  // Add back military retirement minus $40,000 subtraction
  taxableRetirementIncome += Math.max(0, militaryRetirement - militarySubtraction);

  // 8. Calculate tax using Virginia income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// West Virginia-specific retirement income tax calculation
function calculateWestVirginiaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("WEST VIRGINIA RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  // 1. Calculate AGI (sum of all income fields)
  const wvAGI =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    (userInputs?.privatePensionIncome || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.annuityIncome || 0);

  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;
  const currentYear = 2024;

  // 2. Social Security Exemption
  let taxableSocialSecurity = socialSecurityIncome;
  // NOTE: currentYear is 2024. For 2025/2026, update this logic accordingly.
  if (currentYear >= 2026) {
    // 100% exempt
    taxableSocialSecurity = 0;
  } else {
    // Before 2025: 100% exempt if AGI ≤ $50k (single) or $100k (joint)
    const agiLimit = isMarried ? 100000 : 50000;
    if (wvAGI <= agiLimit) {
      taxableSocialSecurity = 0;
    }
    // else: taxed as ordinary income
    // For 2025: 65% exempt for all (add this logic when currentYear === 2025)
  }

  // 3. Public-Sector & Military Retirement: fully exempt
  const exemptPublicPension =
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0);
  // Federal pension plans (civil service, etc.) assumed included in otherGovernmentPension

  // 4. Calculate total retirement income (excluding fully exempt public/military/teacher/firefighter/police/federal pensions)
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += (userInputs?.iraDistributions || 0);
  totalRetirementIncome += (userInputs?.k401Distributions || 0);
  totalRetirementIncome += (userInputs?.annuityIncome || 0);
  // Subtract fully exempt public/military/teacher/firefighter/police/federal pensions
  totalRetirementIncome -= exemptPublicPension;
  totalRetirementIncome = Math.max(0, totalRetirementIncome);

  // 5. Pension/IRA/Annuity deduction if 65+
  let pensionDeduction = 0;
  if (age >= 65) {
    pensionDeduction += 8000;
    if (isMarried && spouseAge && spouseAge >= 65) {
      pensionDeduction += 8000; // $16,000 for married couple both 65+
    }
  }
  pensionDeduction = Math.min(pensionDeduction, totalRetirementIncome);

  // 6. Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += taxableSocialSecurity;
  taxableRetirementIncome += Math.max(0, totalRetirementIncome - pensionDeduction);

  console.log("WV retirement tax calculation:", {
    wvAGI,
    socialSecurityIncome,
    taxableSocialSecurity,
    exemptPublicPension,
    totalRetirementIncome,
    pensionDeduction,
    taxableRetirementIncome,
  });

  // 7. Calculate tax using WV income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Wisconsin-specific retirement income tax calculation
function calculateWisconsinRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("WISCONSIN RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  // 1. Social Security & Railroad Retirement: fully exempt
  const taxableSocialSecurity = 0;

  // 2. Calculate AGI (sum of all income fields)
  const wiAGI =
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    (userInputs?.privatePensionIncome || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.militaryRetirementPay || 0) +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.annuityIncome || 0);

  const isMarried = filingStatus.toLowerCase().includes("married");

  // 3. Exemptions for certain pensions
  // Pre-1964 WI public pensions (not tracked in userInputs, so not exempted here unless fields are added)
  // Military retirement pay and federal civil service (CSRS) benefits are fully exempt
  const exemptPension = (userInputs?.militaryRetirementPay || 0) + (userInputs?.otherGovernmentPension || 0); // Assume CSRS included in otherGovernmentPension

  // 4. Calculate total retirement income (excluding fully exempt pensions)
  let totalRetirementIncome = 0;
  totalRetirementIncome += privatePensionIncome;
  totalRetirementIncome += publicPensionIncome;
  totalRetirementIncome += (userInputs?.teacherPension || 0);
  totalRetirementIncome += (userInputs?.policePension || 0);
  totalRetirementIncome += (userInputs?.firefighterPension || 0);
  totalRetirementIncome += (userInputs?.iraDistributions || 0);
  totalRetirementIncome += (userInputs?.k401Distributions || 0);
  totalRetirementIncome += (userInputs?.annuityIncome || 0);
  // Subtract fully exempt pensions
  totalRetirementIncome -= exemptPension;
  totalRetirementIncome = Math.max(0, totalRetirementIncome);

  // 5. Age-based retirement income subtraction
  let ageSubtraction = 0;
  if (age >= 65) {
    if (!isMarried && wiAGI < 15000) {
      ageSubtraction = Math.min(5000, totalRetirementIncome);
    } else if (isMarried && wiAGI < 30000) {
      ageSubtraction = Math.min(5000, totalRetirementIncome);
    }
  }

  // 6. Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += taxableSocialSecurity;
  taxableRetirementIncome += Math.max(0, totalRetirementIncome - ageSubtraction);

  console.log("WI retirement tax calculation:", {
    wiAGI,
    socialSecurityIncome,
    taxableSocialSecurity,
    exemptPension,
    totalRetirementIncome,
    ageSubtraction,
    taxableRetirementIncome,
  });

  // 7. Calculate tax using WI income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// District of Columbia-specific retirement income tax calculation
function calculateDistrictOfColumbiaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and Tier 1 Railroad are fully exempt
  const taxableSocialSecurity = 0;

  // Military retirement exclusion: up to $3,000 for age 62+
  let militaryRetirement = userInputs?.militaryRetirementPay || 0;
  let militaryExclusion = 0;
  if (age >= 62 && militaryRetirement > 0) {
    militaryExclusion = Math.min(3000, militaryRetirement);
  }
  const taxableMilitaryRetirement = Math.max(0, militaryRetirement - militaryExclusion);

  // In-state public pension exclusion: up to $3,000 for age 65+
  // We'll treat all publicPensionIncome as in-state for now
  let publicPensionExclusion = 0;
  if (age >= 65 && publicPensionIncome > 0) {
    publicPensionExclusion = Math.min(3000, publicPensionIncome);
  }
  const taxablePublicPension = Math.max(0, publicPensionIncome - publicPensionExclusion);

  // All other retirement income is fully taxable
  let taxableRetirementIncome = 0;
  taxableRetirementIncome += privatePensionIncome;
  taxableRetirementIncome += taxablePublicPension;
  taxableRetirementIncome += iraDistributions;
  taxableRetirementIncome += taxableMilitaryRetirement;
  taxableRetirementIncome += (userInputs?.teacherPension || 0);
  taxableRetirementIncome += (userInputs?.policePension || 0);
  taxableRetirementIncome += (userInputs?.firefighterPension || 0);
  taxableRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  taxableRetirementIncome += (userInputs?.k401Distributions || 0);
  taxableRetirementIncome += (userInputs?.annuityIncome || 0);
  // Do NOT add Social Security

  // Calculate tax using DC income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Alabama-specific retirement income tax calculation
function calculateAlabamaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  console.log("ALABAMA RETIREMENT TAX DEBUG:", {
    socialSecurityIncome,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    filingStatus,
    age,
    userInputs,
  });

  let taxableRetirementIncome = 0;

  // Social Security is NOT taxed in Alabama
  const taxableSocialSecurity = 0;

  // Private pension income is taxable
  taxableRetirementIncome += privatePensionIncome;

  // Specific public pensions are EXEMPT:
  // - Alabama Teachers' Retirement System
  // - Alabama Employees' Retirement System  
  // - Alabama Judicial Retirement
  // - Federal CSRS
  // - Railroad Retirement
  // - Peace Officer & Firefighter pensions
  // 
  // For now, we'll exempt all public pension income since we don't have specific fields
  // to distinguish between exempt and non-exempt public pensions
  console.log("Alabama: Public pension income exempt:", publicPensionIncome);
  console.log("Alabama: Teacher/police/firefighter pensions exempt:", 
    (userInputs?.teacherPension || 0) + 
    (userInputs?.policePension || 0) + 
    (userInputs?.firefighterPension || 0));
  console.log("Alabama: Other government pension exempt:", userInputs?.otherGovernmentPension || 0);

  // IRA/401k distributions are taxable with $12,000 exemption per person 65+
  let taxableIra = iraDistributions;
  if (age >= 65) {
    let exemption = 12000; // $12,000 per person
    if (filingStatus.toLowerCase().includes("married")) {
      exemption *= 2; // $24,000 for married
    }
    taxableIra = Math.max(0, taxableIra - exemption);
    console.log("Alabama: IRA exemption applied:", exemption, "taxable IRA:", taxableIra);
  }
  taxableRetirementIncome += taxableIra;

  // Military retirement is taxable (no special exemption in Alabama)
  taxableRetirementIncome += (userInputs?.militaryRetirementPay || 0);

  console.log("Alabama retirement tax calculation:", {
    taxableSocialSecurity,
    privatePensionIncome,
    publicPensionIncome,
    taxableIra,
    militaryRetirement: userInputs?.militaryRetirementPay || 0,
    taxableRetirementIncome,
  });

  // Calculate tax using Alabama income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Main function to calculate tax burden for a specific state
export async function calculateStateTaxBurden(
  stateCode: string,
  userInputs: UserTaxInputs,
): Promise<TaxCalculationResult & { nhInterestDividendsTax?: number }> {
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

    // --- NH: Calculate interest & dividends tax as a separate field ---
    let nhInterestDividendsTax = 0;
    if (stateCode === "NH") {
      nhInterestDividendsTax = calculateNewHampshireInterestDividendsTax(stateData, userInputs);
    }

    // Calculate total income
    const shortTermGains = Number(userInputs.shortTermCapitalGains) || 0;
    let longTermGains = Number(userInputs.longTermCapitalGains) || 0;

    // Apply state-specific long-term capital gains rules
    if (stateCode === "AZ") {
      // Arizona: 25% subtraction for long-term capital gains from assets acquired after 2012
      longTermGains = longTermGains * 0.75;
    } else if (stateCode === "MT") {
      // Montana: 50% deduction on net long-term capital gains
      longTermGains = longTermGains * 0.5;
    } else if (stateCode === "ND") {
      // North Dakota: 40% exclusion on net long-term capital gains
      longTermGains = longTermGains * 0.6;
    } else if (stateCode === "WI") {
      // Wisconsin: 30% exclusion on net long-term capital gains
      longTermGains = longTermGains * 0.7;
    }

    // Net self-employment income after expenses
    const netSelfEmploymentIncome = Math.max(
      0,
      (userInputs.selfEmploymentIncome || 0) - (userInputs.selfEmploymentExpenses || 0)
    );

    const totalIncome =
      (userInputs.annualIncome || 0) +
      netSelfEmploymentIncome +
      (userInputs.rentalIncome || 0) +
      (userInputs.interestIncome || 0) +
      (userInputs.dividendsIncome || 0) +
      shortTermGains +
      longTermGains +
      (userInputs.unemploymentIncome || 0) +
      (userInputs.gamblingWinnings || 0)
      // ...other income sources as needed
      ;

    // For alimony, apply deduction if Alabama and pre-2019 divorce:
    let alimonyDeduction = 0
    if (
      stateCode === "AL" &&
      userInputs.alAlimonyPaid &&
      userInputs.alAlimonyPaid > 0 &&
      userInputs.alDivorceDate &&
      new Date(userInputs.alDivorceDate) < new Date("2019-01-01")
    ) {
      alimonyDeduction = userInputs.alAlimonyPaid
    }
    const adjustedIncome = totalIncome - alimonyDeduction

    console.log(`Total income: ${adjustedIncome}`)

    // Georgia, Hawaii, and Idaho-specific: Use federal AGI as starting point instead of total income
    let incomeForDeduction = adjustedIncome;
    if (stateCode === "GA" || stateCode === "HI" || stateCode === "ID") {
      // Calculate federal AGI using a similar approach
      const federalAGI = calculateFederalAGI(userInputs);
      incomeForDeduction = federalAGI;
      console.log(`${stateCode}: Using federal AGI of ${federalAGI} instead of total income ${adjustedIncome}`);
    }

    // Apply state standard deduction (supports flat or bracketed values)
    let stdDeduction = getStandardDeductionForState(
      stateData as any,
      userInputs.filingStatus,
      incomeForDeduction,
    )

    // Apply Connecticut personal exemption if applicable
    if (stateCode === "CT") {
      const ctPersonalExemption = calculateConnecticutPersonalExemption(
        adjustedIncome,
        userInputs.filingStatus,
        stateData
      );
      console.log(`Connecticut personal exemption: $${ctPersonalExemption}`);
      stdDeduction += ctPersonalExemption;
    }

    // Apply Hawaii personal exemptions if applicable
    if (stateCode === "HI") {
      const hiPersonalExemptions = calculateHawaiiPersonalExemptions(
        stateData,
        userInputs.filingStatus,
        numDependents,
        userInputs.age || 0,
        userInputs.spouseAge
      );
      console.log(`Hawaii personal exemptions: $${hiPersonalExemptions}`);
      stdDeduction += hiPersonalExemptions;
    }

    // Arizona: additional standard deduction for age 65+
    if (stateCode === "AZ") {
      const filingKey = normalizeFilingStatus(userInputs.filingStatus)
      const taxpayerIs65Plus = (userInputs.age || 0) >= 65
      const spouseIs65Plus = (userInputs.spouseAge || 0) >= 65

      let azAdditional = 0
      if (filingKey === "married") {
        // $1,600 per spouse 65+
        if (taxpayerIs65Plus) azAdditional += 1600
        if (spouseIs65Plus) azAdditional += 1600
      } else if (filingKey === "marriedSeparate") {
        // $1,600 if the filer is 65+
        if (taxpayerIs65Plus) azAdditional += 1600
      } else {
        // single or headOfHousehold: $2,000 if 65+
        if (taxpayerIs65Plus) azAdditional += 2000
      }

      stdDeduction += azAdditional
    }

    // Delaware: additional standard deduction for age 65+ (ignore blind per requirements)
    if (stateCode === "DE") {
      const filingKey = normalizeFilingStatus(userInputs.filingStatus)
      const taxpayerIs65Plus = (userInputs.age || 0) >= 65
      const spouseIs65Plus = (userInputs.spouseAge || 0) >= 65

      // Prefer reading from data if present, default to $2,500
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

      stdDeduction += deAdditional
    }

    // Georgia, Hawaii, and Idaho-specific: Calculate income after deduction using federal AGI
    let incomeBeforeStdDeduction = adjustedIncome;
    if (stateCode === "GA" || stateCode === "HI" || stateCode === "ID") {
      incomeBeforeStdDeduction = incomeForDeduction;
    }
    
    const incomeAfterStdDeduction = Math.max(0, incomeBeforeStdDeduction - stdDeduction)

    // Calculate income tax
    let incomeTaxBurden = 0
    if (stateData.incomeTax && stateData.incomeTax.hasIncomeTax) {
      // Use standard income tax calculation for all states with income AFTER std deduction
      incomeTaxBurden = calculateIncomeTax(
        incomeAfterStdDeduction,
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
      userInputs.age || 65, // Use user's age, default to 65 if not provided
      userInputs // Pass userInputs for Arizona-specific rules
    )
    console.log(`Retirement tax burden: ${retirementTaxBurden}`)

    // Calculate property tax
    let propertyTaxBurden = 0
    if (stateCode === userInputs.residenceState && userInputs.propertyTax > 0) {
      // For the home state, use actual property tax if provided
      propertyTaxBurden = userInputs.propertyTax
      console.log(`DEBUG: Using actual property tax for home state: ${propertyTaxBurden}`)
    } else if (userInputs.futurePlans === "buy") {
      // If planning to buy, estimate based on housing budget (converted to home value)
      // Rough estimate: Annual housing budget * 12 * 15 (assuming 15-year mortgage)
      const estimatedHomeValue = userInputs.housingBudget * 12 * 15
      propertyTaxBurden = estimatePropertyTax(stateData, estimatedHomeValue)
    } else if (userInputs.homeValue > 0) {
      // If currently a homeowner, use similar home value for comparison
      propertyTaxBurden = estimatePropertyTax(stateData, userInputs.homeValue)
    }
    console.log(`DEBUG: Property tax burden: ${propertyTaxBurden}`)

    // Calculate sales tax using the enhanced function with updated data
    const salesTaxBurden = estimateSalesTax(stateData, userInputs)
    console.log(`Sales tax burden: ${salesTaxBurden}`)

    // Calculate vehicle-related taxes
    const vehicleTaxBurden = calculateVehicleTax(stateData, userInputs)
    console.log(`Vehicle tax burden: ${vehicleTaxBurden}`)

    // Calculate total tax burden
    let totalTaxBurden = incomeTaxBurden + retirementTaxBurden + propertyTaxBurden + salesTaxBurden + vehicleTaxBurden
    // Add NH interest & dividends tax if applicable
    if (stateCode === "NH") {
      totalTaxBurden += nhInterestDividendsTax;
    }
    console.log(`Total tax burden: ${totalTaxBurden}`)

    // Apply California Senior Head of Household Credit if applicable
    let finalTaxBurden = totalTaxBurden;
    if (stateCode === "CA") {
      const seniorCredit = calculateCaliforniaSeniorCredit(userInputs, totalTaxBurden);
      if (seniorCredit > 0) {
        finalTaxBurden = Math.max(0, totalTaxBurden - seniorCredit);
        console.log(`California Senior Head of Household Credit applied: $${seniorCredit.toFixed(2)}`);
        console.log(`Final tax burden after credit: $${finalTaxBurden.toFixed(2)}`);
      }
    }
    // Apply Ohio Retirement Income and Senior Citizen Credits if applicable
    if (stateCode === "OH") {
      // MAGI for credit purposes: sum of all income except Social Security, Railroad, and Military
      const magi =
        (userInputs.annualIncome || 0) +
        (userInputs.investmentIncome || 0) +
        (userInputs.rentalIncome || 0) +
        (userInputs.royaltyIncome || 0) +
        (userInputs.trustIncome || 0) +
        (userInputs.privatePensionIncome || 0) +
        (userInputs.teacherPension || 0) +
        (userInputs.policePension || 0) +
        (userInputs.firefighterPension || 0) +
        (userInputs.otherGovernmentPension || 0) +
        (userInputs.iraDistributions || 0) +
        (userInputs.k401Distributions || 0) +
        (userInputs.annuityIncome || 0);
      let retirementCredit = 0;
      // Retirement Income Credit: up to $200 if MAGI < $100,000 and has retirement income
      const retirementIncomeSum =
        (userInputs.privatePensionIncome || 0) +
        (userInputs.teacherPension || 0) +
        (userInputs.policePension || 0) +
        (userInputs.firefighterPension || 0) +
        (userInputs.otherGovernmentPension || 0) +
        (userInputs.iraDistributions || 0) +
        (userInputs.k401Distributions || 0) +
        (userInputs.annuityIncome || 0);
      if (magi < 100000 && retirementIncomeSum > 0) {
        // Credit is $50-$200 depending on total retirement income (simplified: use $200 if any retirement income)
        retirementCredit = 200;
      }
      // Senior Citizen Credit: $50 if age 65+ and MAGI < $100,000
      let seniorCredit = 0;
      if ((userInputs.age || 0) >= 65 && magi < 100000) {
        seniorCredit = 50;
      }
      const totalCredits = retirementCredit + seniorCredit;
      if (totalCredits > 0) {
        finalTaxBurden = Math.max(0, finalTaxBurden - totalCredits);
      }
    }

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
      totalTaxBurden: finalTaxBurden,
      incomeTaxBurden,
      retirementTaxBurden,
      propertyTaxBurden,
      salesTaxBurden,
      vehicleTaxBurden,
      estimatedAnnualSavings,
      costOfLivingIndex: stateData.costOfLivingIndex || 100,
      lifestyleMatch,
      regionMatch,
      nhInterestDividendsTax: stateCode === "NH" ? nhInterestDividendsTax : undefined,
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
      nhInterestDividendsTax: stateCode === "NH" ? 0 : undefined,
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

// Maryland-specific retirement income tax calculation
function calculateMarylandRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is NOT taxed
  // Eligible for $39,500 exemption (65+ or disabled): pensions, 401k/403b/457b
  // Military retirement: $12,500 if under 55, $20,000 if 55+
  // Traditional IRAs, Roth IRAs, SEPs, Keoghs are fully taxable (no exclusions)
  const isMarried = filingStatus.toLowerCase().includes("married");
  const spouseAge = userInputs?.spouseAge;
  const isDisabled = false; // If you have a disability flag, use it here
  const spouseDisabled = false; // If you have a spouse disability flag, use it here

  // Primary taxpayer
  let taxableRetirementIncome = 0;
  
  // Pensions and 401k/403b/457b (eligible for $39,500 exemption if 65+ or disabled)
  let eligiblePensionIncome = 
    (privatePensionIncome || 0) +
    (publicPensionIncome || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0) +
    (userInputs?.k401Distributions || 0); // 401k/403b/457b distributions are eligible for exemption
  
  let pensionExemption = 0;
  if (age >= 65 || isDisabled || spouseDisabled) {
    pensionExemption = (stateData.retirementIncome as any)?.retirementIncomeExemption || 39500;
  }
  let taxablePensionIncome = Math.max(0, eligiblePensionIncome - pensionExemption);
  taxableRetirementIncome += taxablePensionIncome;

  // Military retirement (separate exemption rules)
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  let militaryExemption = 0;
  if (age >= 55) {
    militaryExemption = (stateData.retirementIncome as any)?.militaryRetirementExemption || 20000;
  } else {
    militaryExemption = (stateData.retirementIncome as any)?.militaryRetirementExemptionUnder55 || 12500;
  }
  let taxableMilitaryIncome = Math.max(0, militaryRetirement - militaryExemption);
  taxableRetirementIncome += taxableMilitaryIncome;

  // Traditional IRAs, Roth IRAs, SEPs, Keoghs are fully taxable (no exclusions)
  // Note: Roth IRA distributions are NOT taxable, but traditional IRA, SEP, and Keogh are
  // For now, iraDistributions includes all IRA types - Roth IRA portion should be excluded
  // In the future, we could split this into separate fields: traditionalIraDistributions, rothIraDistributions, sepDistributions, keoghDistributions
  taxableRetirementIncome += (iraDistributions || 0);

  // Spouse (if married)
  if (isMarried && typeof spouseAge === "number") {
    // Spouse pension exemption
    let spousePensionExemption = 0;
    if (spouseAge >= 65 || isDisabled || spouseDisabled) {
      spousePensionExemption = (stateData.retirementIncome as any)?.retirementIncomeExemption || 39500;
    }
    // For now, assume spouse has same eligible income as primary (or add spouse-specific fields later)
    let spouseEligiblePensionIncome = 0; // userInputs?.spousePrivatePensionIncome + userInputs?.spouseK401Distributions
    let spouseTaxablePensionIncome = Math.max(0, spouseEligiblePensionIncome - spousePensionExemption);
    taxableRetirementIncome += spouseTaxablePensionIncome;

    // Spouse military retirement
    let spouseMilitaryExemption = 0;
    if (spouseAge >= 55) {
      spouseMilitaryExemption = (stateData.retirementIncome as any)?.militaryRetirementExemption || 20000;
    } else {
      spouseMilitaryExemption = (stateData.retirementIncome as any)?.militaryRetirementExemptionUnder55 || 12500;
    }
    let spouseMilitaryRetirement = 0; // userInputs?.spouseMilitaryRetirementPay
    let spouseTaxableMilitaryIncome = Math.max(0, spouseMilitaryRetirement - spouseMilitaryExemption);
    taxableRetirementIncome += spouseTaxableMilitaryIncome;

    // Spouse IRA distributions (fully taxable - traditional IRA, Roth IRA, SEP, Keogh)
    let spouseIraDistributions = 0; // userInputs?.spouseIraDistributions
    taxableRetirementIncome += spouseIraDistributions;
  }

  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Massachusetts-specific retirement income tax calculation
function calculateMassachusettsRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and government pensions are NOT taxed
  // Private pensions, IRAs, and 401k are taxed at 5% flat rate
  // 4% surcharge on income above $1 million (total 9% over that threshold)
  const isMarried = filingStatus.toLowerCase().includes("married");
  const isHeadOfHousehold = filingStatus.toLowerCase().includes("head");
  const spouseAge = userInputs?.spouseAge;

  // Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  
  // Private pensions, IRAs, and 401k are taxable
  taxableRetirementIncome += (privatePensionIncome || 0);
  taxableRetirementIncome += (iraDistributions || 0);
  taxableRetirementIncome += (userInputs?.k401Distributions || 0);
  
  // Government pensions are exempt (teacher, police, firefighter, other government)
  // These are NOT added to taxable income
  console.log("Massachusetts: Government pensions exempt:", 
    (userInputs?.teacherPension || 0) + 
    (userInputs?.policePension || 0) + 
    (userInputs?.firefighterPension || 0) + 
    (userInputs?.otherGovernmentPension || 0));

  // Calculate personal exemption
  let personalExemption = 0;
  if (isMarried) {
    personalExemption = 8800; // $8,800 for married filing jointly
  } else if (isHeadOfHousehold) {
    personalExemption = 6800; // $6,800 for head of household
  } else {
    personalExemption = 4400; // $4,400 for single
  }
  
  // Add senior exemption ($700 per person 65+)
  if (age >= 65) {
    personalExemption += 700;
  }
  if (isMarried && spouseAge && spouseAge >= 65) {
    personalExemption += 700;
  }

  // Apply personal exemption
  const taxableAfterExemption = Math.max(0, taxableRetirementIncome - personalExemption);

  // Calculate tax at 5% flat rate
  let tax = taxableAfterExemption * 0.05;

  // Apply 4% surcharge on income above $1 million
  const surchargeThreshold = (stateData.retirementIncome as any)?.millionaireSurchargeThreshold || 1000000;
  const surchargeRate = (stateData.retirementIncome as any)?.millionaireSurchargeRate || 4;
  
  if (taxableAfterExemption > surchargeThreshold) {
    const surchargeAmount = (taxableAfterExemption - surchargeThreshold) * (surchargeRate / 100);
    tax += surchargeAmount;
    console.log("Massachusetts: Applied millionaire surcharge:", surchargeAmount);
  }

  console.log("Massachusetts retirement tax calculation:", {
    taxableRetirementIncome,
    personalExemption,
    taxableAfterExemption,
    baseTax: taxableAfterExemption * 0.05,
    surchargeThreshold,
    totalTax: tax
  });

  return tax;
}

// Michigan-specific retirement income tax calculation
function calculateMichiganRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security and railroad retirement are NOT taxed
  // Retirement/pension income has phased exemptions based on birth year (2025 phase-in)
  // Public safety pensions (teacher, police, firefighter) are fully exempt
  const currentYear = 2025;
  const birthYear = currentYear - age;
  const phaseInYear = (stateData.retirementIncome as any)?.retirementIncomePhaseInYear || 2025;

  // Calculate exemption percentage based on birth year and phase-in year
  let exemptionPercentage = 0;
  if (birthYear <= 1945) {
    exemptionPercentage = 100; // 100% exempt for all years
  } else if (birthYear >= 1946 && birthYear <= 1958) {
    if (phaseInYear >= 2025) exemptionPercentage = 75; // 75% in 2025
    else if (phaseInYear >= 2026) exemptionPercentage = 100; // 100% in 2026+
  } else if (birthYear >= 1959 && birthYear <= 1962) {
    if (phaseInYear >= 2025) exemptionPercentage = 75; // 75% in 2025
    else if (phaseInYear >= 2026) exemptionPercentage = 100; // 100% in 2026+
  } else if (birthYear >= 1963 && birthYear <= 1966) {
    if (phaseInYear >= 2025) exemptionPercentage = 75; // 75% in 2025
    else if (phaseInYear >= 2026) exemptionPercentage = 100; // 100% in 2026+
  } else if (birthYear >= 1967) {
    if (phaseInYear >= 2026) exemptionPercentage = 100; // 100% in 2026+
  }

  // Calculate taxable retirement income
  let totalRetirementIncome = 0;
  
  // Private pensions, IRAs, and 401k are subject to phased exemption
  totalRetirementIncome += (privatePensionIncome || 0);
  totalRetirementIncome += (iraDistributions || 0);
  totalRetirementIncome += (userInputs?.k401Distributions || 0);
  
  // Public safety pensions are fully exempt (teacher, police, firefighter)
  const publicSafetyPensions = 
    (userInputs?.teacherPension || 0) + 
    (userInputs?.policePension || 0) + 
    (userInputs?.firefighterPension || 0);
  console.log("Michigan: Public safety pensions fully exempt:", publicSafetyPensions);
  
  // Other government pensions are subject to phased exemption
  totalRetirementIncome += (userInputs?.otherGovernmentPension || 0);

  // Apply phased exemption
  const exemptAmount = totalRetirementIncome * (exemptionPercentage / 100);
  const taxableRetirementIncome = totalRetirementIncome - exemptAmount;

  console.log("Michigan retirement tax calculation:", {
    birthYear,
    phaseInYear,
    exemptionPercentage,
    totalRetirementIncome,
    exemptAmount,
    taxableRetirementIncome,
    publicSafetyPensions
  });

  // Michigan has a flat 4.25% tax rate
  return taxableRetirementIncome * 0.0425;
}

// Minnesota-specific retirement income tax calculation
function calculateMinnesotaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is taxable but has AGI-based exemptions with phase-out
  // Public pensions have AGI-based subtractions with phase-out
  // Military/railroad retirement is exempt
  // Private pensions, IRAs, and 401k are fully taxable
  const isMarried = filingStatus.toLowerCase().includes("married");
  const isHeadOfHousehold = filingStatus.toLowerCase().includes("head");

  // Calculate Minnesota AGI (simplified - using total income as proxy)
  const minnesotaAGI = 
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    socialSecurityIncome +
    privatePensionIncome +
    publicPensionIncome +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Calculate Social Security exemption based on AGI
  let socialSecurityExemption = 0;
  if (socialSecurityIncome > 0) {
    const agiThreshold = isMarried ? 
      ((stateData.retirementIncome as any)?.socialSecurityAgiThresholdMarried || 100000) :
      ((stateData.retirementIncome as any)?.socialSecurityAgiThresholdSingle || 78000);
    
    if (minnesotaAGI <= agiThreshold) {
      socialSecurityExemption = socialSecurityIncome; // Full exemption
    } else {
      // Phase-out: 10% reduction per $2,000 over threshold
      const excess = minnesotaAGI - agiThreshold;
      const reductionIncrements = Math.ceil(excess / 2000);
      const reductionPercentage = Math.min(reductionIncrements * 10, 100);
      const exemptionPercentage = Math.max(0, 100 - reductionPercentage);
      socialSecurityExemption = socialSecurityIncome * (exemptionPercentage / 100);
    }
  }

  // Calculate public pension subtraction based on AGI
  let publicPensionSubtraction = 0;
  const publicPensionIncomeTotal = 
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);
  
  if (publicPensionIncomeTotal > 0) {
    const subtractionAmount = isMarried ? 
      ((stateData.retirementIncome as any)?.publicPensionSubtractionAmount || 25000) :
      ((stateData.retirementIncome as any)?.publicPensionSubtractionSingle || 12500);
    
    const agiThreshold = isMarried ? 100000 : 78000; // Same thresholds as Social Security
    
    if (minnesotaAGI <= agiThreshold) {
      publicPensionSubtraction = Math.min(publicPensionIncomeTotal, subtractionAmount);
    } else {
      // Phase-out: 10% reduction per $2,000 over threshold
      const excess = minnesotaAGI - agiThreshold;
      const reductionIncrements = Math.ceil(excess / 2000);
      const reductionPercentage = Math.min(reductionIncrements * 10, 100);
      const subtractionPercentage = Math.max(0, 100 - reductionPercentage);
      publicPensionSubtraction = Math.min(publicPensionIncomeTotal, subtractionAmount) * (subtractionPercentage / 100);
    }
  }

  // Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  
  // Social Security (taxable with exemption)
  taxableRetirementIncome += Math.max(0, socialSecurityIncome - socialSecurityExemption);
  
  // Private pensions, IRAs, and 401k are fully taxable
  taxableRetirementIncome += (privatePensionIncome || 0);
  taxableRetirementIncome += (iraDistributions || 0);
  taxableRetirementIncome += (userInputs?.k401Distributions || 0);
  
  // Public pensions (taxable with subtraction)
  taxableRetirementIncome += Math.max(0, publicPensionIncomeTotal - publicPensionSubtraction);
  
  // Military/railroad retirement is exempt
  console.log("Minnesota: Military retirement exempt:", userInputs?.militaryRetirementPay || 0);

  console.log("Minnesota retirement tax calculation:", {
    minnesotaAGI,
    socialSecurityIncome,
    socialSecurityExemption,
    publicPensionIncomeTotal,
    publicPensionSubtraction,
    taxableRetirementIncome
  });

  // Calculate tax using Minnesota income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Missouri-specific retirement income tax calculation
function calculateMissouriRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security is exempt for 62+ or disabled (no AGI limit)
  // Public pensions have deduction up to $46,381 (offset by Social Security exclusion)
  // Private pensions/IRAs have $6,000 exemption with AGI limits
  const isMarried = filingStatus.toLowerCase().includes("married");
  const isMarriedSeparate = filingStatus.toLowerCase().includes("separate");
  const isHeadOfHousehold = filingStatus.toLowerCase().includes("head");
  const isDisabled = false; // If you have a disability flag, use it here

  // Calculate Missouri AGI (simplified - using total income as proxy)
  const missouriAGI = 
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    socialSecurityIncome +
    privatePensionIncome +
    publicPensionIncome +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Social Security exemption (62+ or disabled)
  let socialSecurityExemption = 0;
  if (age >= 62 || isDisabled) {
    socialSecurityExemption = socialSecurityIncome; // Fully exempt
  }

  // Public pension deduction (up to $46,381, offset by Social Security exclusion)
  let publicPensionDeduction = 0;
  const totalPublicPensionIncome = 
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);
  
  if (totalPublicPensionIncome > 0) {
    const deductionCap = (stateData.retirementIncome as any)?.publicPensionDeductionCap || 46381;
    const socialSecurityExclusion = socialSecurityIncome - socialSecurityExemption; // Amount of Social Security that was taxed
    const availableDeduction = Math.max(0, deductionCap - socialSecurityExclusion);
    publicPensionDeduction = Math.min(totalPublicPensionIncome, availableDeduction);
  }

  // Private retirement exemption ($6,000 with AGI limits)
  let privateRetirementExemption = 0;
  const privateRetirementIncome = 
    (privatePensionIncome || 0) +
    (iraDistributions || 0) +
    (userInputs?.k401Distributions || 0);
  
  if (privateRetirementIncome > 0) {
    const exemptionAmount = (stateData.retirementIncome as any)?.privateRetirementExemption || 6000;
    
    // Determine AGI threshold based on filing status
    let agiThreshold = 0;
    if (isMarriedSeparate) {
      agiThreshold = (stateData.retirementIncome as any)?.privateRetirementExemptionAgiMarriedSeparate || 16000;
    } else if (isMarried) {
      agiThreshold = (stateData.retirementIncome as any)?.privateRetirementExemptionAgiMarried || 32000;
    } else {
      agiThreshold = (stateData.retirementIncome as any)?.privateRetirementExemptionAgiSingle || 25000;
    }
    
    if (missouriAGI <= agiThreshold) {
      privateRetirementExemption = Math.min(privateRetirementIncome, exemptionAmount);
    }
  }

  // Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  
  // Social Security (exempt if 62+ or disabled)
  taxableRetirementIncome += Math.max(0, socialSecurityIncome - socialSecurityExemption);
  
  // Public pensions (deductible up to cap, offset by Social Security exclusion)
  taxableRetirementIncome += Math.max(0, totalPublicPensionIncome - publicPensionDeduction);
  
  // Private pensions, IRAs, and 401k (exempt up to $6,000 with AGI limits)
  taxableRetirementIncome += Math.max(0, privateRetirementIncome - privateRetirementExemption);
  
  // Military retirement is exempt
  console.log("Missouri: Military retirement exempt:", userInputs?.militaryRetirementPay || 0);

  console.log("Missouri retirement tax calculation:", {
    missouriAGI,
    age,
    isDisabled,
    socialSecurityIncome,
    socialSecurityExemption,
    totalPublicPensionIncome,
    publicPensionDeduction,
    privateRetirementIncome,
    privateRetirementExemption,
    taxableRetirementIncome
  });

  // Calculate tax using Missouri income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Montana-specific retirement income tax calculation
function calculateMontanaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security has tiered exemption based on AGI
  // Military retirement has 50% exemption limited by Montana wages (with residency restrictions)
  // Age 65+ gets $5,500 subtraction ($11,000 married)
  const isMarried = filingStatus.toLowerCase().includes("married");
  const isMarriedSeparate = filingStatus.toLowerCase().includes("separate");

  // Calculate Montana AGI (simplified - using total income as proxy)
  const montanaAGI = 
    (userInputs?.annualIncome || 0) +
    (userInputs?.investmentIncome || 0) +
    (userInputs?.rentalIncome || 0) +
    (userInputs?.royaltyIncome || 0) +
    (userInputs?.trustIncome || 0) +
    socialSecurityIncome +
    privatePensionIncome +
    publicPensionIncome +
    (userInputs?.iraDistributions || 0) +
    (userInputs?.k401Distributions || 0) +
    (userInputs?.teacherPension || 0) +
    (userInputs?.policePension || 0) +
    (userInputs?.firefighterPension || 0) +
    (userInputs?.otherGovernmentPension || 0);

  // Social Security tiered exemption based on AGI
  let socialSecurityExemption = 0;
  if (socialSecurityIncome > 0) {
    const agiThreshold = isMarried ? 
      (stateData.retirementIncome as any)?.socialSecurityAgiThresholdMarried || 32000 :
      (stateData.retirementIncome as any)?.socialSecurityAgiThresholdSingle || 25000;
    
    const agiPhaseOut = isMarried ? 
      (stateData.retirementIncome as any)?.socialSecurityAgiPhaseOutMarried || 44000 :
      (stateData.retirementIncome as any)?.socialSecurityAgiPhaseOutSingle || 34000;
    
    if (montanaAGI <= agiThreshold) {
      socialSecurityExemption = socialSecurityIncome; // Full exclusion
    } else if (montanaAGI <= agiPhaseOut) {
      socialSecurityExemption = socialSecurityIncome * 0.5; // 50% exclusion
    } else {
      socialSecurityExemption = socialSecurityIncome * 0.15; // 15% exclusion
    }
  }

  // Military retirement exemption (50% limited by Montana wages) with residency restrictions
  let militaryExemption = 0;
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  if (militaryRetirement > 0) {
    // Check residency requirements for military retirement exemption
    // The exemption is NOT available to residents that became residents before July 1, 2023 
    // if they began receiving military benefits before becoming Montana residents
    const becameMontanaResidentBeforeJuly2023 = userInputs?.becameMontanaResidentBeforeJuly2023 || false;
    const beganMilitaryBenefitsBeforeMontanaResidency = userInputs?.beganMilitaryBenefitsBeforeMontanaResidency || false;
    
    let eligibleForMilitaryExemption = true;
    
    if (becameMontanaResidentBeforeJuly2023 && beganMilitaryBenefitsBeforeMontanaResidency) {
      eligibleForMilitaryExemption = false;
      console.log("Montana: Military retirement exemption not available - became resident before July 2023 and began military benefits before Montana residency");
    }
    
    if (eligibleForMilitaryExemption) {
      // For now, assume all wages are Montana wages (in future, could add separate field)
      const montanaWages = userInputs?.annualIncome || 0;
      const exemptionPercent = (stateData.retirementIncome as any)?.militaryRetirementExemptionPercent || 50;
      const maxExemption = militaryRetirement * (exemptionPercent / 100);
      militaryExemption = Math.min(maxExemption, montanaWages);
      console.log("Montana: Military retirement exemption applied:", militaryExemption);
    } else {
      console.log("Montana: Military retirement fully taxable due to residency restrictions");
    }
  }

  // Age 65+ subtraction
  let ageSubtraction = 0;
  if (age >= 65) {
    if (isMarried) {
      ageSubtraction = (stateData.retirementIncome as any)?.age65SubtractionMarried || 11000;
    } else {
      ageSubtraction = (stateData.retirementIncome as any)?.age65Subtraction || 5500;
    }
  }

  // Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  
  // Social Security (tiered exemption)
  taxableRetirementIncome += Math.max(0, socialSecurityIncome - socialSecurityExemption);
  
  // Private pensions, IRAs, and 401k (fully taxable)
  taxableRetirementIncome += (privatePensionIncome || 0);
  taxableRetirementIncome += (iraDistributions || 0);
  taxableRetirementIncome += (userInputs?.k401Distributions || 0);
  
  // Public pensions (fully taxable)
  taxableRetirementIncome += (publicPensionIncome || 0);
  taxableRetirementIncome += (userInputs?.teacherPension || 0);
  taxableRetirementIncome += (userInputs?.policePension || 0);
  taxableRetirementIncome += (userInputs?.firefighterPension || 0);
  taxableRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  
  // Military retirement (50% exemption limited by Montana wages, subject to residency restrictions)
  taxableRetirementIncome += Math.max(0, militaryRetirement - militaryExemption);

  // Apply age 65+ subtraction
  const taxableAfterAgeSubtraction = Math.max(0, taxableRetirementIncome - ageSubtraction);

  console.log("Montana retirement tax calculation:", {
    montanaAGI,
    age,
    isMarried,
    becameMontanaResidentBeforeJuly2023: userInputs?.becameMontanaResidentBeforeJuly2023,
    beganMilitaryBenefitsBeforeMontanaResidency: userInputs?.beganMilitaryBenefitsBeforeMontanaResidency,
    socialSecurityIncome,
    socialSecurityExemption,
    militaryRetirement,
    militaryExemption,
    ageSubtraction,
    taxableRetirementIncome,
    taxableAfterAgeSubtraction
  });

  // Calculate tax using Montana income tax brackets
  return calculateIncomeTax(taxableAfterAgeSubtraction, stateData.incomeTax.brackets, filingStatus);
}

// Nebraska-specific retirement income tax calculation
function calculateNebraskaRetirementTax(
  stateData: StateTaxData,
  socialSecurityIncome: number,
  privatePensionIncome: number,
  publicPensionIncome: number,
  iraDistributions: number,
  filingStatus: string,
  age: number,
  userInputs?: UserTaxInputs,
): number {
  // Social Security: 50% inclusion rate (2025 onward)
  // Military retirement: 100% excluded
  // All other retirement income: fully taxable at Nebraska rates
  const isMarried = filingStatus.toLowerCase().includes("married");

  // Social Security inclusion (50% for 2025 onward)
  let taxableSocialSecurity = 0;
  if (socialSecurityIncome > 0) {
    const inclusionRate = (stateData.retirementIncome as any)?.socialSecurityInclusionRate || 50;
    taxableSocialSecurity = socialSecurityIncome * (inclusionRate / 100);
  }

  // Military retirement is 100% excluded
  const militaryRetirement = userInputs?.militaryRetirementPay || 0;
  console.log("Nebraska: Military retirement fully exempt:", militaryRetirement);

  // Calculate taxable retirement income
  let taxableRetirementIncome = 0;
  
  // Social Security (50% inclusion)
  taxableRetirementIncome += taxableSocialSecurity;
  
  // Private pensions, IRAs, and 401k (fully taxable)
  taxableRetirementIncome += (privatePensionIncome || 0);
  taxableRetirementIncome += (iraDistributions || 0);
  taxableRetirementIncome += (userInputs?.k401Distributions || 0);
  
  // Public pensions (fully taxable)
  taxableRetirementIncome += (publicPensionIncome || 0);
  taxableRetirementIncome += (userInputs?.teacherPension || 0);
  taxableRetirementIncome += (userInputs?.policePension || 0);
  taxableRetirementIncome += (userInputs?.firefighterPension || 0);
  taxableRetirementIncome += (userInputs?.otherGovernmentPension || 0);
  
  // Military retirement is NOT included (100% excluded)

  console.log("Nebraska retirement tax calculation:", {
    socialSecurityIncome,
    taxableSocialSecurity,
    militaryRetirement,
    privatePensionIncome,
    publicPensionIncome,
    iraDistributions,
    k401Distributions: userInputs?.k401Distributions || 0,
    taxableRetirementIncome
  });

  // Calculate tax using Nebraska income tax brackets
  return calculateIncomeTax(taxableRetirementIncome, stateData.incomeTax.brackets, filingStatus);
}

// Alabama-specific income tax calculation with alimony deduction
function calculateAlabamaIncomeTax(
  income: number,
  brackets: FilingStatusBrackets | StateTaxBracket[],
  filingStatus: string,
  dependents: number,
  userInputs: UserTaxInputs
): number {
  console.log("ALABAMA INCOME TAX DEBUG:", {
    income,
    filingStatus,
    dependents,
    alimonyPaid: userInputs.alAlimonyPaid,
    divorceDate: userInputs.alDivorceDate,
    isAlimonyRecipient: userInputs.alIsAlimonyRecipient
  });

  // Calculate Alabama AGI (same as federal AGI for alimony purposes)
  let alabamaAGI = income;

  // Apply alimony deduction if eligible
  let alimonyDeduction = 0;
  if (userInputs.alAlimonyPaid && userInputs.alAlimonyPaid > 0) {
    // Check if divorce agreement was before December 31, 2018
    if (userInputs.alDivorceDate) {
      const divorceDate = new Date(userInputs.alDivorceDate);
      const cutoffDate = new Date('2018-12-31');
      
      if (divorceDate <= cutoffDate) {
        // Pre-2019 agreement: alimony is deductible
        alimonyDeduction = userInputs.alAlimonyPaid;
        console.log("Alabama: Pre-2019 divorce agreement, alimony deduction applied:", alimonyDeduction);
      } else {
        // Post-2018 agreement: alimony is NOT deductible
        console.log("Alabama: Post-2018 divorce agreement, no alimony deduction allowed");
      }
    } else {
      // No divorce date provided, assume pre-2019 for deduction
      alimonyDeduction = userInputs.alAlimonyPaid;
      console.log("Alabama: No divorce date provided, assuming pre-2019 and applying alimony deduction:", alimonyDeduction);
    }
  }

  // Calculate taxable income after alimony deduction
  const taxableIncome = Math.max(0, alabamaAGI - alimonyDeduction);

  console.log("Alabama income tax calculation:", {
    originalIncome: income,
    alimonyDeduction,
    taxableIncome,
    divorceDate: userInputs.alDivorceDate
  });

  // Calculate tax using standard income tax function
  return calculateIncomeTax(taxableIncome, brackets, filingStatus, dependents);
}

// Add below the imports at the top of the file
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
    if (agi >= min && agi <= max) return b.deduction || 0;
  }
  return 0;
}

export function getStandardDeductionForState(stateData: any, filingStatus: string, agi: number): number {
  const key = normalizeFilingStatus(filingStatus);
  const stdInIncomeTax = stateData?.incomeTax?.standardDeduction?.[key] as number | StandardDeductionBracket[] | undefined;
  const stdTopLevel = (stateData as any)?.standardDeduction?.[key] as number | StandardDeductionBracket[] | undefined;
  const std = (stdInIncomeTax ?? stdTopLevel) as number | StandardDeductionBracket[] | undefined;
  return resolveStandardDeduction(std, agi);
}

// Calculate federal AGI (Adjusted Gross Income) for Georgia tax purposes
function calculateFederalAGI(userInputs: UserTaxInputs): number {
  // Calculate total income (similar to totalIncome calculation in main function)
  const shortTermGains = Number(userInputs.shortTermCapitalGains) || 0;
  const longTermGains = Number(userInputs.longTermCapitalGains) || 0;
  
  // Net self-employment income after expenses
  const netSelfEmploymentIncome = Math.max(
    0,
    (userInputs.selfEmploymentIncome || 0) - (userInputs.selfEmploymentExpenses || 0)
  );

  const totalIncome =
    (userInputs.annualIncome || 0) +
    netSelfEmploymentIncome +
    (userInputs.rentalIncome || 0) +
    (userInputs.interestIncome || 0) +
    (userInputs.dividendsIncome || 0) +
    shortTermGains +
    longTermGains +
    (userInputs.unemploymentIncome || 0) +
    (userInputs.gamblingWinnings || 0);

  // Apply basic federal adjustments to get AGI
  // This is a simplified federal AGI calculation - in reality it would include more adjustments
  let adjustments = 0;
  
  // Self-employment tax deduction (half of SE tax)
  if (netSelfEmploymentIncome > 0) {
    const seTax = netSelfEmploymentIncome * 0.153; // 15.3% SE tax rate
    adjustments += seTax * 0.5; // Half is deductible
  }
  
  // Note: We don't include IRA distributions here as they are retirement income, not AGI adjustments
  // In a full implementation, we would include IRA contributions/deductions, but this is simplified
  
  // Other common federal adjustments could be added here if needed in the userInputs interface
  
  const federalAGI = Math.max(0, totalIncome - adjustments);
  
  console.log(`Federal AGI calculation: Total Income ${totalIncome} - Adjustments ${adjustments} = AGI ${federalAGI}`);
  
  return federalAGI;
}
