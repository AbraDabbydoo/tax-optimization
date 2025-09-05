// This file loads the state tax data from the JSON files


export interface StateTaxBracket {
  min: number
  max: number | null
  rate: number
}

export interface FilingStatusBrackets {
  single: StateTaxBracket[]
  married: StateTaxBracket[]
  headOfHousehold: StateTaxBracket[]
}

export interface SalesTaxCategories {
  groceries: { taxable: boolean; rate: number }
  preparedFood: { taxable: boolean; rate: number }
  utilities: { taxable: boolean; rate: number }
  services: { taxable: boolean; rate: number }
  digitalGoods: { taxable: boolean; rate: number }
  medicine: { taxable: boolean; rate: number }
  streamingSubscriptions: { taxable: boolean; rate: number }
}

export type SalesTaxCategory = keyof SalesTaxCategories

// Define the structure of the state tax data
export interface StateTaxData {
  name: string
  abbreviation: string
  incomeTax: {
    hasIncomeTax: boolean
    brackets: FilingStatusBrackets
    personalExemption: number
    dependentExemption: number
    additionalPersonalExemption65Plus?: number
    additionalPersonalExemptionBlind?: number
    personalExemptionPhaseout?: {
      dependentThreshold: number
      description: string
    }
    standardDeduction: {
      single: number
      married: number
      headOfHousehold: number
    }
    taxCredits: {
      childTaxCredit: number
      childCareTaxCredit: number
      earnedIncomeTaxCredit: boolean
    }
  }
  salesTax: {
    stateRate: number
    averageLocalRate: number
    combinedRate: number
    categories: SalesTaxCategories
  }
  propertyTax: {
    averageEffectiveRate: number
    medianAnnualTax: number
  }
  retirementIncome: {
    socialSecurityTaxed: boolean
    publicPensionsTaxed: boolean
    privatePensionsTaxed: boolean
    iraDistributionsTaxed: boolean
    militaryRetirementTaxed?: boolean
    teacherPoliceFirefighterExemption?: number
    teacherPoliceFirefighterExemptionMarried?: number
    retirementIncomeExemption: number
    retirementIncomeExemptionAgeRequirement: number
    iraAnd401kExemption?: number
    iraAnd401kExemptionAgeRequirement?: number
  }
  vehicleTax: {
    rate: number
    hasRelief: boolean
    isCountyBased: boolean
    specialAssessmentRules: string
    exemptionPerVehicle?: number
  }
  costOfLivingIndex: number
  lifestyleTags: string[]
}

// Create a record of state tax data
export type StateTaxDataRecord = Record<string, StateTaxData>

// Load the state tax data
export const stateTaxData: StateTaxDataRecord = {}

// Function to load the state tax data
async function loadStateTaxData(): Promise<StateTaxDataRecord> {
  try {
    console.log("Loading state tax data...")
    
    let data1, data2;
    
    // Check if we're running on the server or client
    if (typeof window === 'undefined') {
      // Server-side: prefer updated files with fallback to legacy paths
      const fs = require('fs');
      const path = require('path');
      
      const updatedPath1 = path.join(process.cwd(), 'public', 'updated-tax-data', 'state-tax-data-updated.json');
      const updatedPath2 = path.join(process.cwd(), 'public', 'updated-tax-data', 'state-tax-data-2-updated.json');
      const dataPath1 = path.join(process.cwd(), 'public', 'data', 'state-tax-data.json');
      const dataPath2 = path.join(process.cwd(), 'public', 'data', 'state-tax-data-2.json');
      
      const file1 = fs.existsSync(updatedPath1) ? updatedPath1 : dataPath1;
      const file2 = fs.existsSync(updatedPath2) ? updatedPath2 : dataPath2;
      
      data1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
      data2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
    } else {
      // Client-side: prefer updated files with fallback to legacy paths
      async function fetchWithFallback(primary: string, fallback: string) {
        try {
          const r = await fetch(primary);
          if (r && r.ok) return await r.json();
        } catch (_) {}
        const r2 = await fetch(fallback);
        return await r2.json();
      }
      
      data1 = await fetchWithFallback('/updated-tax-data/state-tax-data-updated.json', '/data/state-tax-data.json');
      data2 = await fetchWithFallback('/updated-tax-data/state-tax-data-2-updated.json', '/data/state-tax-data-2.json');
    }

    // Combine the data
    const combinedData = { ...data1, ...data2 };

    console.log(`Loaded tax data for ${Object.keys(combinedData).length} states`);

    // Add the data to the stateTaxData object
    Object.assign(stateTaxData, combinedData);

    return combinedData;
  } catch (error) {
    console.error("Error loading state tax data:", error);
    throw new Error("Failed to load state tax data");
  }
}
// Create a promise to load the state tax data
export const stateTaxDataPromise = loadStateTaxData()
