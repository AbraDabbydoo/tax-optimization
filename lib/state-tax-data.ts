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


// Utility to load a single state's tax data for a given year (default 2025)
export async function getStateTaxData(stateAbbr: string, year: string = "2025"): Promise<StateTaxData | null> {
  const fileName = `${stateAbbr.toUpperCase()}.json`;
  // Server-side
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'updated-tax-data', year, fileName);
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`Error loading state tax data for ${stateAbbr} (${year}):`, err);
      return null;
    }
  } else {
    // Client-side
    try {
      const res = await fetch(`/updated-tax-data/${year}/${fileName}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error(`Error loading state tax data for ${stateAbbr} (${year}):`, err);
      return null;
    }
  }
}
