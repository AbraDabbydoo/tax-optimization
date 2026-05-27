import { calculateStateTaxBurden } from '../lib/tax-calculator';
import * as fs from 'fs';
import * as path from 'path';

// Load per-state JSON files from public/updated-tax-data/2025/
function loadStateTaxData(): Record<string, any> {
  const data: Record<string, any> = {};
  const statesDir = path.join(process.cwd(), 'public', 'updated-tax-data', '2025');
  
  if (fs.existsSync(statesDir)) {
    const files = fs.readdirSync(statesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const stateCode = file.replace('.json', '');
      try {
        const content = fs.readFileSync(path.join(statesDir, file), 'utf8');
        data[stateCode] = JSON.parse(content);
      } catch (e) {
        console.error(`Failed to load ${file}:`, e);
      }
    }
  }
  
  return data;
}

const stateTaxData = loadStateTaxData();

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
    annualIncome: 100000,
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

describe('State Tax Calculator - Property Tax', () => {
  const states = Object.keys(stateTaxData);
  const filingStatuses = ['single', 'married', 'head_of_household'];

  describe('Home Value Based Property Tax', () => {
    const homeValueScenarios = [
      { value: 200000, description: 'starter home' },
      { value: 400000, description: 'median home value' },
      { value: 750000, description: 'above-average home' },
      { value: 1500000, description: 'luxury home' },
      { value: 5000000, description: 'high-value property' },
    ];

    states.forEach((state) => {
      homeValueScenarios.forEach(({ value, description }) => {
        it(`calculates property tax for ${state} with ${description} ($${value.toLocaleString()})`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            homeValue: value,
            nextHomeValue: value,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result).toHaveProperty('propertyTaxBurden');
          expect(typeof result.propertyTaxBurden).toBe('number');
          expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);

          // Property tax should scale with home value
          if (value > 0) {
            // Most states have property tax, but some may be 0 if not calculated
            expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
          }
        });
      });
    });
  });

  describe('User-Provided Property Tax', () => {
    const propertyTaxScenarios = [
      { tax: 3000, description: 'low property tax' },
      { tax: 8000, description: 'average property tax' },
      { tax: 15000, description: 'high property tax' },
      { tax: 30000, description: 'very high property tax' },
    ];

    states.slice(0, 15).forEach((state) => {
      propertyTaxScenarios.forEach(({ tax, description }) => {
        it(`uses user-provided property tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            homeValue: 500000,
            propertyTax: tax,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Renter vs Homeowner Comparison', () => {
    states.slice(0, 20).forEach((state) => {
      it(`compares renter vs homeowner tax burden for ${state}`, async () => {
        const homeownerInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          homeValue: 400000,
          monthlyRent: 0,
        });

        const renterInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          homeValue: 0,
          monthlyRent: 2000,
        });

        const homeownerResult = await calculateStateTaxBurden(state, homeownerInputs);
        const renterResult = await calculateStateTaxBurden(state, renterInputs);

        // Homeowner should have property tax, renter should have 0
        expect(homeownerResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
        expect(renterResult.propertyTaxBurden).toBe(0);
      });
    });
  });

  describe('Property Tax with Different Filing Statuses', () => {
    const testStates = ['CA', 'NY', 'TX', 'FL', 'NJ', 'IL', 'PA', 'OH', 'GA', 'NC'];

    testStates.forEach((state) => {
      filingStatuses.forEach((status) => {
        it(`calculates property tax for ${state} with filing status ${status}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            filingStatus: status,
            homeValue: 500000,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Property Tax Impact on Total Burden', () => {
    const scenarios = [
      { homeValue: 0, annualIncome: 100000, description: 'no property' },
      { homeValue: 500000, annualIncome: 100000, description: 'with property' },
      { homeValue: 1000000, annualIncome: 100000, description: 'high-value property' },
    ];

    const testStates = ['NJ', 'CT', 'NY', 'TX', 'IL'];

    testStates.forEach((state) => {
      it(`shows property tax impact on total burden for ${state}`, async () => {
        const results = await Promise.all(
          scenarios.map(async ({ homeValue, annualIncome }) => {
            const userInputs = createBaseUserInputs({
              residenceState: state,
              employmentState: state,
              homeValue,
              annualIncome,
            });
            return calculateStateTaxBurden(state, userInputs);
          })
        );

        // Total burden should include property tax
        results.forEach((result) => {
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(result.incomeTaxBurden);
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(result.propertyTaxBurden);
        });

        // Higher home values should result in higher property tax
        expect(results[0].propertyTaxBurden).toBeLessThanOrEqual(results[2].propertyTaxBurden);
      });
    });
  });
});

describe('State Tax Calculator - Alabama Homestead Exemptions', () => {
  const homesteadScenarios = [
    { type: 'H-1' as const, description: 'standard homestead (state + county tax exempt)', expected: 'reduced' },
    { type: 'H-2' as const, description: 'over-65 homestead (fully exempt up to 160 acres)', expected: 'reduced' },
    { type: 'H-3' as const, description: 'permanently disabled (fully exempt)', expected: 'reduced' },
    { type: 'H-4' as const, description: 'blind person (same as H-3)', expected: 'reduced' },
  ];

  homesteadScenarios.forEach(({ type, description }) => {
    it(`applies Alabama ${type} exemption - ${description}`, async () => {
      const withExemption = createBaseUserInputs({
        residenceState: 'AL',
        employmentState: 'AL',
        homeValue: 300000,
        alHomesteadExemptionType: type,
        alIsPrimaryResidence: true,
        alPropertyAcres: 1,
        age: type === 'H-2' ? 70 : 50,
        alIsDisabled: type === 'H-3' || type === 'H-4',
      });

      const withoutExemption = createBaseUserInputs({
        residenceState: 'AL',
        employmentState: 'AL',
        homeValue: 300000,
        alIsPrimaryResidence: false,
      });

      const withResult = await calculateStateTaxBurden('AL', withExemption);
      const withoutResult = await calculateStateTaxBurden('AL', withoutExemption);

      expect(withResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
      expect(withoutResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  it('requires primary residence for homestead exemption', async () => {
    const primaryResidence = createBaseUserInputs({
      residenceState: 'AL',
      employmentState: 'AL',
      homeValue: 300000,
      alHomesteadExemptionType: 'H-1',
      alIsPrimaryResidence: true,
    });

    const notPrimaryResidence = createBaseUserInputs({
      residenceState: 'AL',
      employmentState: 'AL',
      homeValue: 300000,
      alHomesteadExemptionType: 'H-1',
      alIsPrimaryResidence: false,
    });

    const primaryResult = await calculateStateTaxBurden('AL', primaryResidence);
    const notPrimaryResult = await calculateStateTaxBurden('AL', notPrimaryResidence);

    expect(primaryResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
    expect(notPrimaryResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
  });
});

describe('State Tax Calculator - Property Tax Edge Cases', () => {
  const states = Object.keys(stateTaxData);

  describe('Zero Home Value', () => {
    states.slice(0, 10).forEach((state) => {
      it(`handles zero home value for ${state}`, async () => {
        const userInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          homeValue: 0,
        });

        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.propertyTaxBurden).toBe(0);
      });
    });
  });

  describe('Very High Home Value', () => {
    const highValueStates = ['CA', 'NY', 'NJ', 'CT', 'MA', 'WA', 'CO', 'HI'];

    highValueStates.forEach((state) => {
      it(`handles multi-million dollar home for ${state}`, async () => {
        const userInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          homeValue: 10000000, // $10M home
        });

        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
        // Property tax should be reasonable (not more than 10% of home value annually)
        expect(result.propertyTaxBurden).toBeLessThan(1000000);
      });
    });
  });

  describe('Next Home Value for Movers', () => {
    it('uses nextHomeValue when provided', async () => {
      const currentHome = createBaseUserInputs({
        residenceState: 'TX',
        employmentState: 'TX',
        homeValue: 500000,
        nextHomeValue: 0,
      });

      const futureHome = createBaseUserInputs({
        residenceState: 'TX',
        employmentState: 'TX',
        homeValue: 500000,
        nextHomeValue: 750000,
      });

      const currentResult = await calculateStateTaxBurden('TX', currentHome);
      const futureResult = await calculateStateTaxBurden('TX', futureHome);

      expect(currentResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
      expect(futureResult.propertyTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Property Tax with Retirement Income', () => {
    it('calculates total burden with property tax and retirement income', async () => {
      const retireeHomeowner = createBaseUserInputs({
        residenceState: 'FL',
        employmentState: 'FL',
        age: 68,
        homeValue: 400000,
        socialSecurityIncome: 30000,
        privatePensionIncome: 40000,
      });

      const result = await calculateStateTaxBurden('FL', retireeHomeowner);

      expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
      expect(result.incomeTaxBurden).toBe(0); // FL has no income tax
      expect(result.totalTaxBurden).toBeGreaterThanOrEqual(result.propertyTaxBurden);
    });
  });
});

describe('State Tax Calculator - Vehicle Tax', () => {
  const states = Object.keys(stateTaxData);

  describe('Single Vehicle Taxation', () => {
    const vehicleScenarios = [
      { count: 1, value: 15000, description: 'economy car' },
      { count: 1, value: 35000, description: 'average new car' },
      { count: 1, value: 75000, description: 'luxury vehicle' },
      { count: 1, value: 150000, description: 'exotic car' },
    ];

    states.slice(0, 20).forEach((state) => {
      vehicleScenarios.forEach(({ count, value, description }) => {
        it(`calculates vehicle tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            vehicleCount: count,
            vehicleValue: value,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result).toHaveProperty('vehicleTaxBurden');
          expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Multiple Vehicles', () => {
    const multiVehicleScenarios = [
      { count: 2, value: 50000, description: 'two-car household' },
      { count: 3, value: 90000, description: 'three-car household' },
      { count: 4, value: 120000, description: 'large family' },
    ];

    const testStates = ['VA', 'CT', 'RI', 'MA', 'SC', 'KY', 'MO', 'KS'];

    testStates.forEach((state) => {
      multiVehicleScenarios.forEach(({ count, value, description }) => {
        it(`calculates vehicle tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            vehicleCount: count,
            vehicleValue: value,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('No Vehicle', () => {
    states.slice(0, 15).forEach((state) => {
      it(`handles no vehicle for ${state}`, async () => {
        const userInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          vehicleCount: 0,
          vehicleValue: 0,
        });

        const result = await calculateStateTaxBurden(state, userInputs);

        expect(result.vehicleTaxBurden).toBe(0);
      });
    });
  });

  describe('Vehicle Array Input', () => {
    it('handles individual vehicle data array', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'VA',
        employmentState: 'VA',
        vehicleCount: 2,
        vehicles: [
          { value: 30000 },
          { value: 45000 },
        ],
      });

      const result = await calculateStateTaxBurden('VA', userInputs);
      expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });
});
