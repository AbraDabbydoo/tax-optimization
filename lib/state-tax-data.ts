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
      // Server-side: use file system path
      const fs = require('fs');
      const path = require('path');
      
      const dataPath1 = path.join(process.cwd(), 'public', 'data', 'state-tax-data.json');
      const dataPath2 = path.join(process.cwd(), 'public', 'data', 'state-tax-data-2.json');
      
      data1 = JSON.parse(fs.readFileSync(dataPath1, 'utf8'));
      data2 = JSON.parse(fs.readFileSync(dataPath2, 'utf8'));
    } else {
      // Client-side: use fetch
      const response1 = await fetch("/data/state-tax-data.json");
      data1 = await response1.json();
      
      const response2 = await fetch("/data/state-tax-data-2.json");
      data2 = await response2.json();
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
