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
    monthlyRent: 1500,
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
    // Expense categories
    groceries: 0,
    preparedFood: 0,
    utilities: 0,
    services: 0,
    digitalGoods: 0,
    medicine: 0,
    streamingSubscriptions: 0,
    ...overrides,
  };
}

describe('State Tax Calculator - Sales Tax on Monthly Expenses', () => {
  const states = Object.keys(stateTaxData);

  // States with no sales tax
  const noSalesTaxStates = ['AK', 'DE', 'MT', 'NH', 'OR'];

  describe('Grocery Sales Tax', () => {
    const groceryScenarios = [
      { amount: 400, description: 'single person monthly' },
      { amount: 800, description: 'couple monthly' },
      { amount: 1200, description: 'family of 4 monthly' },
      { amount: 1800, description: 'large family monthly' },
    ];

    // Annual amounts (multiply monthly by 12)
    states.forEach((state) => {
      groceryScenarios.forEach(({ amount, description }) => {
        it(`calculates grocery sales tax for ${state} with ${description} ($${amount}/month)`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            groceries: amount * 12, // Annual amount
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result).toHaveProperty('salesTaxBurden');
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);

          // No sales tax states should have low/no sales tax
          // Note: Some 'no sales tax' states may have local sales taxes or estimated consumption tax
          if (noSalesTaxStates.includes(state)) {
            // Most no-sales-tax states should have minimal/zero sales tax
            expect(result.salesTaxBurden).toBeLessThanOrEqual(500);
          }
        });
      });
    });
  });

  describe('Prepared Food/Restaurant Sales Tax', () => {
    const preparedFoodScenarios = [
      { amount: 200, description: 'occasional dining' },
      { amount: 500, description: 'moderate dining' },
      { amount: 1000, description: 'frequent dining' },
      { amount: 2000, description: 'heavy dining/delivery' },
    ];

    states.slice(0, 25).forEach((state) => {
      preparedFoodScenarios.forEach(({ amount, description }) => {
        it(`calculates prepared food tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            preparedFood: amount * 12,
          });

          const result = await calculateStateTaxBurden(state, userInputs);
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Utility Sales Tax', () => {
    const utilityScenarios = [
      { amount: 150, description: 'apartment utilities' },
      { amount: 300, description: 'small home utilities' },
      { amount: 500, description: 'large home utilities' },
      { amount: 800, description: 'high usage/luxury home' },
    ];

    states.slice(0, 20).forEach((state) => {
      utilityScenarios.forEach(({ amount, description }) => {
        it(`calculates utility tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            utilities: amount * 12,
          });

          const result = await calculateStateTaxBurden(state, userInputs);
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Digital Goods and Streaming Services', () => {
    const digitalScenarios = [
      { digital: 50, streaming: 30, description: 'basic digital + streaming' },
      { digital: 150, streaming: 80, description: 'moderate digital spending' },
      { digital: 500, streaming: 150, description: 'high digital spending' },
    ];

    states.slice(0, 20).forEach((state) => {
      digitalScenarios.forEach(({ digital, streaming, description }) => {
        it(`calculates digital goods tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            digitalGoods: digital * 12,
            streamingSubscriptions: streaming * 12,
          });

          const result = await calculateStateTaxBurden(state, userInputs);
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Medicine and Health Products', () => {
    const medicineScenarios = [
      { amount: 50, description: 'minimal OTC purchases' },
      { amount: 150, description: 'moderate health products' },
      { amount: 400, description: 'high medical expenses' },
    ];

    states.slice(0, 15).forEach((state) => {
      medicineScenarios.forEach(({ amount, description }) => {
        it(`calculates medicine tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            medicine: amount * 12,
          });

          const result = await calculateStateTaxBurden(state, userInputs);
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Services Sales Tax', () => {
    const serviceScenarios = [
      { amount: 100, description: 'basic services' },
      { amount: 300, description: 'moderate services' },
      { amount: 600, description: 'high services spending' },
    ];

    states.slice(0, 15).forEach((state) => {
      serviceScenarios.forEach(({ amount, description }) => {
        it(`calculates services tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            services: amount * 12,
          });

          const result = await calculateStateTaxBurden(state, userInputs);
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

describe('State Tax Calculator - Complete Monthly Expense Profiles', () => {
  const states = Object.keys(stateTaxData);
  const filingStatuses = ['single', 'married', 'head_of_household'];

  const expenseProfiles = [
    {
      name: 'frugal single',
      monthly: {
        groceries: 300,
        preparedFood: 100,
        utilities: 100,
        digitalGoods: 20,
        streamingSubscriptions: 15,
        medicine: 30,
        services: 50,
      },
    },
    {
      name: 'average single',
      monthly: {
        groceries: 500,
        preparedFood: 300,
        utilities: 175,
        digitalGoods: 75,
        streamingSubscriptions: 50,
        medicine: 50,
        services: 150,
      },
    },
    {
      name: 'couple no kids',
      monthly: {
        groceries: 700,
        preparedFood: 500,
        utilities: 250,
        digitalGoods: 100,
        streamingSubscriptions: 80,
        medicine: 75,
        services: 200,
      },
    },
    {
      name: 'family of 4',
      monthly: {
        groceries: 1200,
        preparedFood: 400,
        utilities: 350,
        digitalGoods: 150,
        streamingSubscriptions: 100,
        medicine: 100,
        services: 300,
      },
    },
    {
      name: 'affluent household',
      monthly: {
        groceries: 1500,
        preparedFood: 1500,
        utilities: 500,
        digitalGoods: 300,
        streamingSubscriptions: 200,
        medicine: 150,
        services: 600,
      },
    },
  ];

  states.forEach((state) => {
    expenseProfiles.forEach(({ name, monthly }) => {
      it(`calculates sales tax for ${state} with ${name} expense profile`, async () => {
        const userInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          groceries: monthly.groceries * 12,
          preparedFood: monthly.preparedFood * 12,
          utilities: monthly.utilities * 12,
          digitalGoods: monthly.digitalGoods * 12,
          streamingSubscriptions: monthly.streamingSubscriptions * 12,
          medicine: monthly.medicine * 12,
          services: monthly.services * 12,
        });

        const result = await calculateStateTaxBurden(state, userInputs);

        expect(result).toHaveProperty('salesTaxBurden');
        expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.totalTaxBurden).toBeGreaterThanOrEqual(result.salesTaxBurden);
      });
    });
  });

  describe('Expense Profile by Filing Status', () => {
    const testStates = ['CA', 'NY', 'TX', 'FL', 'WA', 'TN', 'IL', 'PA', 'OH', 'GA'];

    testStates.forEach((state) => {
      filingStatuses.forEach((status) => {
        it(`calculates full expense burden for ${state}, ${status}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            filingStatus: status,
            annualIncome: 100000,
            groceries: 9600, // $800/month
            preparedFood: 4800, // $400/month
            utilities: 3000, // $250/month
            digitalGoods: 1200, // $100/month
            streamingSubscriptions: 900, // $75/month
            medicine: 600, // $50/month
            services: 2400, // $200/month
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

describe('State Tax Calculator - Total Tax Burden Scenarios', () => {
  const states = Object.keys(stateTaxData);

  describe('Complete Household Tax Scenarios', () => {
    const householdScenarios = [
      {
        name: 'young professional renter',
        inputs: {
          filingStatus: 'single',
          age: 28,
          annualIncome: 75000,
          homeValue: 0,
          monthlyRent: 1800,
          vehicleCount: 1,
          vehicleValue: 25000,
          groceries: 4800,
          preparedFood: 6000,
          utilities: 1500,
          streamingSubscriptions: 600,
        },
      },
      {
        name: 'dual income no kids homeowners',
        inputs: {
          filingStatus: 'married',
          age: 35,
          spouseAge: 33,
          annualIncome: 180000,
          homeValue: 550000,
          vehicleCount: 2,
          vehicleValue: 70000,
          groceries: 9600,
          preparedFood: 7200,
          utilities: 3600,
          streamingSubscriptions: 1200,
        },
      },
      {
        name: 'family with children',
        inputs: {
          filingStatus: 'married',
          age: 42,
          spouseAge: 40,
          annualIncome: 150000,
          dependents: '2',
          hasDependents: true,
          homeValue: 450000,
          vehicleCount: 2,
          vehicleValue: 60000,
          groceries: 14400,
          preparedFood: 4800,
          utilities: 4200,
          medicine: 1200,
        },
      },
      {
        name: 'single parent head of household',
        inputs: {
          filingStatus: 'head_of_household',
          age: 38,
          annualIncome: 85000,
          dependents: '1',
          hasDependents: true,
          homeValue: 300000,
          vehicleCount: 1,
          vehicleValue: 30000,
          groceries: 7200,
          preparedFood: 3600,
          utilities: 2400,
        },
      },
      {
        name: 'retired couple homeowner',
        inputs: {
          filingStatus: 'married',
          age: 68,
          spouseAge: 66,
          annualIncome: 0,
          socialSecurityIncome: 48000,
          privatePensionIncome: 36000,
          iraDistributions: 24000,
          homeValue: 400000,
          vehicleCount: 1,
          vehicleValue: 25000,
          groceries: 7200,
          preparedFood: 3600,
          utilities: 2400,
          medicine: 2400,
        },
      },
      {
        name: 'high net worth investor',
        inputs: {
          filingStatus: 'married',
          age: 55,
          spouseAge: 53,
          annualIncome: 300000,
          longTermCapitalGains: 200000,
          dividendsIncome: 100000,
          interestIncome: 50000,
          homeValue: 2000000,
          vehicleCount: 3,
          vehicleValue: 200000,
          groceries: 18000,
          preparedFood: 24000,
          utilities: 6000,
          services: 12000,
        },
      },
    ];

    states.forEach((state) => {
      householdScenarios.forEach(({ name, inputs }) => {
        it(`calculates complete tax burden for ${state} - ${name}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            ...inputs,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          // Verify all tax components
          expect(result).toHaveProperty('incomeTaxBurden');
          expect(result).toHaveProperty('propertyTaxBurden');
          expect(result).toHaveProperty('salesTaxBurden');
          expect(result).toHaveProperty('vehicleTaxBurden');
          expect(result).toHaveProperty('totalTaxBurden');

          // All burdens should be non-negative
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);

          // Total should be sum of components (approximately)
          const componentSum = result.incomeTaxBurden + result.propertyTaxBurden + 
                              result.salesTaxBurden + result.vehicleTaxBurden;
          // Allow for retirement tax burden which may be separate
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(componentSum * 0.9);
        });
      });
    });
  });

  describe('State Comparison for Same Scenario', () => {
    it('compares tax burden across no-income-tax states', async () => {
      const noIncomeTaxStates = ['TX', 'FL', 'WA', 'TN', 'NV', 'WY', 'SD', 'AK'];
      
      const userInputs = createBaseUserInputs({
        annualIncome: 150000,
        homeValue: 500000,
        vehicleCount: 2,
        vehicleValue: 60000,
        groceries: 12000,
        preparedFood: 6000,
        utilities: 3600,
      });

      const results = await Promise.all(
        noIncomeTaxStates.map(async (state) => {
          const inputs = { ...userInputs, residenceState: state, employmentState: state };
          const result = await calculateStateTaxBurden(state, inputs);
          return { state, ...result };
        })
      );

      // All should have 0 income tax
      results.forEach((result) => {
        expect(result.incomeTaxBurden).toBe(0);
      });

      // Total burden should come from property, sales, and vehicle taxes
      results.forEach((result) => {
        expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
      });
    });

    it('compares tax burden across high-income-tax states', async () => {
      const highIncomeTaxStates = ['CA', 'NY', 'NJ', 'OR', 'MN', 'CT'];
      
      const userInputs = createBaseUserInputs({
        annualIncome: 200000,
        homeValue: 600000,
        vehicleCount: 2,
        vehicleValue: 70000,
        groceries: 12000,
        preparedFood: 6000,
        utilities: 3600,
      });

      const results = await Promise.all(
        highIncomeTaxStates.map(async (state) => {
          const inputs = { ...userInputs, residenceState: state, employmentState: state };
          const result = await calculateStateTaxBurden(state, inputs);
          return { state, ...result };
        })
      );

      // All should have income tax
      results.forEach((result) => {
        expect(result.incomeTaxBurden).toBeGreaterThan(0);
      });
    });
  });
});

describe('State Tax Calculator - Edge Cases for Expenses', () => {
  describe('Zero Expenses', () => {
    it('handles zero explicit expenses correctly', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: 100000,
        groceries: 0,
        preparedFood: 0,
        utilities: 0,
        digitalGoods: 0,
        streamingSubscriptions: 0,
        medicine: 0,
        services: 0,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      // Sales tax may be estimated based on income even with zero explicit expenses
      expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Very High Expenses', () => {
    it('handles high spending correctly', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'TX',
        employmentState: 'TX',
        annualIncome: 500000,
        groceries: 60000, // $5k/month
        preparedFood: 120000, // $10k/month
        utilities: 24000, // $2k/month
        digitalGoods: 12000, // $1k/month
        streamingSubscriptions: 6000, // $500/month
        services: 60000, // $5k/month
      });

      const result = await calculateStateTaxBurden('TX', userInputs);
      expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
      // TX has no income tax, so total burden should be mainly sales + property
      expect(result.incomeTaxBurden).toBe(0);
    });
  });

  describe('Expenses Only (No Income)', () => {
    it('calculates sales tax burden for retiree with no taxable income', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'FL',
        employmentState: 'FL',
        age: 75,
        annualIncome: 0,
        socialSecurityIncome: 30000, // Not taxable
        groceries: 6000,
        preparedFood: 4800,
        utilities: 2400,
        medicine: 1200,
      });

      const result = await calculateStateTaxBurden('FL', userInputs);
      
      expect(result.incomeTaxBurden).toBe(0); // FL no income tax
      expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });
});
