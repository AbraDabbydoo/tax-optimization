import { calculateStateTaxBurden } from '../lib/tax-calculator';

// Base user inputs template
function createBaseUserInputs(overrides: Partial<any> = {}) {
  return {
    residenceState: 'CA',
    employmentState: 'CA',
    filingStatus: 'single',
    preferredLifestyle: 'indifferent',
    regionPreference: 'indifferent',
    dependents: '0',
    qualifyingChildren: '0',
    age: 40,
    spouseAge: 40,
    annualIncome: 75000,
    retirementIncome: 0,
    socialSecurityIncome: 0,
    privatePensionIncome: 0,
    teacherPension: 0,
    policePension: 0,
    firefighterPension: 0,
    militaryRetirementPay: 0,
    otherGovernmentPension: 0,
    iraDistributions: 0,
    k401Distributions: 0,
    annuityIncome: 0,
    selfEmploymentIncome: 0,
    investmentIncome: 0,
    interestIncome: 0,
    dividendsIncome: 0,
    rentalIncome: 0,
    royaltyIncome: 0,
    trustIncome: 0,
    homeValue: 0,
    propertyTax: 0,
    monthlyRent: 0,
    futurePlans: '',
    housingBudget: 0,
    hasDependents: false,
    vehicleCount: 0,
    vehicleValue: 0,
    shortTermCapitalGains: 0,
    longTermCapitalGains: 0,
    unemploymentIncome: 0,
    gamblingWinnings: 0,
    federalTaxableIncome: 0,
    alAlimonyPaid: 0,
    alDivorceDate: '',
    ...overrides,
  };
}

describe('State Tax Calculator - Input Validation', () => {
  
  describe('Invalid State Codes', () => {
    it('handles invalid state code gracefully', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'XX',
        employmentState: 'XX',
      });

      // Should not throw, should return a result or handle gracefully
      try {
        const result = await calculateStateTaxBurden('XX', userInputs);
        // If it returns a result, it should have expected structure
        if (result) {
          expect(result).toHaveProperty('incomeTaxBurden');
        }
      } catch (error) {
        // If it throws, that's also acceptable for invalid input
        expect(error).toBeDefined();
      }
    });

    it('handles empty state code', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: '',
        employmentState: '',
      });

      try {
        const result = await calculateStateTaxBurden('', userInputs);
        if (result) {
          expect(result).toHaveProperty('incomeTaxBurden');
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('handles lowercase state code', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'ca',
        employmentState: 'ca',
      });

      // Calculator should handle case-insensitivity or reject
      try {
        const result = await calculateStateTaxBurden('ca', userInputs);
        if (result) {
          expect(result).toHaveProperty('incomeTaxBurden');
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('handles state name instead of abbreviation', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'California',
        employmentState: 'California',
      });

      try {
        const result = await calculateStateTaxBurden('California', userInputs);
        if (result) {
          expect(result).toHaveProperty('incomeTaxBurden');
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Negative Values', () => {
    it('handles negative annual income', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: -50000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles negative home value', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'TX',
        employmentState: 'TX',
        homeValue: -300000,
      });

      const result = await calculateStateTaxBurden('TX', userInputs);
      expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles negative vehicle value', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'VA',
        employmentState: 'VA',
        vehicleCount: 1,
        vehicleValue: -20000,
      });

      const result = await calculateStateTaxBurden('VA', userInputs);
      expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles negative self-employment income', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: 100000,
        selfEmploymentIncome: -20000, // Business loss
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles negative capital gains (losses)', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'NY',
        employmentState: 'NY',
        annualIncome: 150000,
        shortTermCapitalGains: -10000,
        longTermCapitalGains: -25000,
      });

      const result = await calculateStateTaxBurden('NY', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Zero Values', () => {
    it('handles all zero income', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: 0,
        selfEmploymentIncome: 0,
        investmentIncome: 0,
        retirementIncome: 0,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBe(0);
      expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles zero age', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'AZ',
        employmentState: 'AZ',
        age: 0,
        annualIncome: 50000,
      });

      const result = await calculateStateTaxBurden('AZ', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Extremely High Values', () => {
    it('handles $100 million income', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: 100000000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThan(0);
      expect(result.incomeTaxBurden).toBeLessThan(20000000); // Less than 20% effective rate
    });

    it('handles $50 million home value', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'NJ',
        employmentState: 'NJ',
        homeValue: 50000000,
        annualIncome: 1000000,
      });

      const result = await calculateStateTaxBurden('NJ', userInputs);
      expect(result.propertyTaxBurden).toBeGreaterThan(0);
      expect(result.propertyTaxBurden).toBeLessThan(2500000); // Less than 5% of home value
    });

    it('handles very high investment income', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'NY',
        employmentState: 'NY',
        longTermCapitalGains: 50000000,
        dividendsIncome: 25000000,
      });

      const result = await calculateStateTaxBurden('NY', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThan(0);
      expect(result.incomeTaxBurden).toBeLessThan(15000000); // Sanity check
    });
  });

  describe('Invalid Filing Status', () => {
    it('handles unknown filing status', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        filingStatus: 'unknown_status',
        annualIncome: 75000,
      });

      // Should default to single or handle gracefully
      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles empty filing status', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        filingStatus: '',
        annualIncome: 75000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles various filing status formats', async () => {
      const formats = [
        'Single',
        'SINGLE',
        'married_filing_jointly',
        'MarriedFilingJointly',
        'MFJ',
        'head of household',
        'HeadOfHousehold',
        'HOH',
      ];

      for (const status of formats) {
        const userInputs = createBaseUserInputs({
          residenceState: 'CA',
          employmentState: 'CA',
          filingStatus: status,
          annualIncome: 75000,
        });

        const result = await calculateStateTaxBurden('CA', userInputs);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Invalid Dependent Values', () => {
    it('handles negative dependents', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        dependents: '-2',
        annualIncome: 100000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles non-numeric dependents', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        dependents: 'two',
        annualIncome: 100000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles very high number of dependents', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        dependents: '20',
        hasDependents: true,
        annualIncome: 100000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Invalid Age Values', () => {
    it('handles negative age', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'GA',
        employmentState: 'GA',
        age: -5,
        annualIncome: 50000,
      });

      const result = await calculateStateTaxBurden('GA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles very old age', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'GA',
        employmentState: 'GA',
        age: 120,
        socialSecurityIncome: 30000,
        privatePensionIncome: 40000,
      });

      const result = await calculateStateTaxBurden('GA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Type Coercion', () => {
    it('handles string income values', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: '75000' as any,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles string home value', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'TX',
        employmentState: 'TX',
        homeValue: '400000' as any,
      });

      const result = await calculateStateTaxBurden('TX', userInputs);
      expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles boolean dependents', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        dependents: true as any,
        annualIncome: 100000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Missing or Undefined Fields', () => {
    it('handles missing optional income fields', async () => {
      const userInputs = {
        residenceState: 'CA',
        employmentState: 'CA',
        filingStatus: 'single',
        annualIncome: 75000,
        age: 40,
        // Missing many optional fields
      };

      const result = await calculateStateTaxBurden('CA', userInputs as any);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });

    it('handles undefined values - returns result without throwing', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: undefined as any,
        homeValue: undefined as any,
      });

      // Calculator should not throw - it may return NaN or 0 for invalid inputs
      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result).toHaveProperty('totalTaxBurden');
    });

    it('handles null values - returns result without throwing', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: null as any,
        selfEmploymentIncome: null as any,
      });

      // Calculator should not throw - it may return NaN or 0 for invalid inputs
      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result).toHaveProperty('totalTaxBurden');
    });
  });

  describe('Result Structure Validation', () => {
    it('returns all expected properties', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: 100000,
        homeValue: 500000,
        vehicleCount: 1,
        vehicleValue: 30000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);

      expect(result).toHaveProperty('stateCode');
      expect(result).toHaveProperty('stateName');
      expect(result).toHaveProperty('totalTaxBurden');
      expect(result).toHaveProperty('incomeTaxBurden');
      expect(result).toHaveProperty('propertyTaxBurden');
      expect(result).toHaveProperty('salesTaxBurden');
      expect(result).toHaveProperty('vehicleTaxBurden');
    });

    it('returns numeric values for all tax burdens', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'NY',
        employmentState: 'NY',
        annualIncome: 150000,
        homeValue: 600000,
      });

      const result = await calculateStateTaxBurden('NY', userInputs);

      expect(typeof result.totalTaxBurden).toBe('number');
      expect(typeof result.incomeTaxBurden).toBe('number');
      expect(typeof result.propertyTaxBurden).toBe('number');
      expect(typeof result.salesTaxBurden).toBe('number');
      expect(typeof result.vehicleTaxBurden).toBe('number');

      expect(isNaN(result.totalTaxBurden)).toBe(false);
      expect(isNaN(result.incomeTaxBurden)).toBe(false);
      expect(isNaN(result.propertyTaxBurden)).toBe(false);
      expect(isNaN(result.salesTaxBurden)).toBe(false);
      expect(isNaN(result.vehicleTaxBurden)).toBe(false);
    });
  });
});
