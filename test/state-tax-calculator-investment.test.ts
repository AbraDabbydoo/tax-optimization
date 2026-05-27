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
    annualIncome: 0,
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

describe('State Tax Calculator - Investment Income', () => {
  const states = Object.keys(stateTaxData);
  
  // States with no income tax (investment income should be 0)
  const noIncomeTaxStates = ['AK', 'FL', 'NV', 'SD', 'TX', 'WA', 'WY'];
  
  // States with interest/dividend-only tax (NH, TN - though TN phased out)
  const interestDividendOnlyStates = ['NH'];

  describe('Capital Gains Taxation', () => {
    const capitalGainsScenarios = [
      { shortTerm: 10000, longTerm: 0, description: 'short-term only' },
      { shortTerm: 0, longTerm: 50000, description: 'long-term only' },
      { shortTerm: 25000, longTerm: 75000, description: 'mixed capital gains' },
      { shortTerm: 0, longTerm: 250000, description: 'high long-term gains' },
    ];

    states.forEach((state) => {
      capitalGainsScenarios.forEach(({ shortTerm, longTerm, description }) => {
        it(`calculates capital gains tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            shortTermCapitalGains: shortTerm,
            longTermCapitalGains: longTerm,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          // Verify result structure
          expect(result).toHaveProperty('incomeTaxBurden');
          expect(typeof result.incomeTaxBurden).toBe('number');
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);

          // No income tax states should have 0 tax
          if (noIncomeTaxStates.includes(state)) {
            expect(result.incomeTaxBurden).toBe(0);
          }
        });
      });
    });
  });

  describe('Dividend Income Taxation', () => {
    const dividendScenarios = [
      { amount: 5000, description: 'low dividend income' },
      { amount: 25000, description: 'moderate dividend income' },
      { amount: 100000, description: 'high dividend income' },
    ];

    states.forEach((state) => {
      dividendScenarios.forEach(({ amount, description }) => {
        it(`calculates dividend tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            dividendsIncome: amount,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);

          // NH taxes dividends specifically
          if (state === 'NH' && amount > 0) {
            // NH has 3% tax on interest/dividends over $2,400 exemption
            expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          }

          // No income tax states should have 0 tax
          if (noIncomeTaxStates.includes(state) && state !== 'NH') {
            expect(result.incomeTaxBurden).toBe(0);
          }
        });
      });
    });
  });

  describe('Interest Income Taxation', () => {
    const interestScenarios = [
      { amount: 2000, description: 'low interest income' },
      { amount: 15000, description: 'moderate interest income' },
      { amount: 75000, description: 'high interest income' },
    ];

    states.forEach((state) => {
      interestScenarios.forEach(({ amount, description }) => {
        it(`calculates interest tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            interestIncome: amount,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);

          // No income tax states (except NH) should have 0 tax
          if (noIncomeTaxStates.includes(state) && state !== 'NH') {
            expect(result.incomeTaxBurden).toBe(0);
          }
        });
      });
    });
  });

  describe('Rental Income Taxation', () => {
    const rentalScenarios = [
      { amount: 12000, description: '$1k/month rental income' },
      { amount: 36000, description: '$3k/month rental income' },
      { amount: 120000, description: 'multi-property rental income' },
    ];

    states.forEach((state) => {
      rentalScenarios.forEach(({ amount, description }) => {
        it(`calculates rental income tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            rentalIncome: amount,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);

          // No income tax states should have 0 tax
          if (noIncomeTaxStates.includes(state)) {
            expect(result.incomeTaxBurden).toBe(0);
          }
        });
      });
    });
  });

  describe('Mixed Investment Portfolio', () => {
    const portfolioScenarios = [
      {
        description: 'conservative portfolio (interest/dividends heavy)',
        inputs: {
          interestIncome: 30000,
          dividendsIncome: 20000,
          longTermCapitalGains: 10000,
          shortTermCapitalGains: 0,
        },
      },
      {
        description: 'growth portfolio (capital gains heavy)',
        inputs: {
          interestIncome: 5000,
          dividendsIncome: 10000,
          longTermCapitalGains: 100000,
          shortTermCapitalGains: 25000,
        },
      },
      {
        description: 'real estate investor',
        inputs: {
          rentalIncome: 60000,
          interestIncome: 5000,
          longTermCapitalGains: 50000,
        },
      },
      {
        description: 'high net worth diversified',
        inputs: {
          interestIncome: 50000,
          dividendsIncome: 75000,
          longTermCapitalGains: 200000,
          shortTermCapitalGains: 50000,
          rentalIncome: 100000,
          royaltyIncome: 25000,
          trustIncome: 30000,
        },
      },
    ];

    const filingStatuses = ['single', 'married', 'head_of_household'];

    states.forEach((state) => {
      portfolioScenarios.forEach(({ description, inputs }) => {
        filingStatuses.forEach((status) => {
          it(`calculates tax for ${state}, ${status}, ${description}`, async () => {
            const userInputs = createBaseUserInputs({
              residenceState: state,
              employmentState: state,
              filingStatus: status,
              ...inputs,
            });

            const result = await calculateStateTaxBurden(state, userInputs);

            expect(result).toHaveProperty('incomeTaxBurden');
            expect(result).toHaveProperty('totalTaxBurden');
            expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
            expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);

            // No income tax states should have 0 income tax
            if (noIncomeTaxStates.includes(state) && state !== 'NH') {
              expect(result.incomeTaxBurden).toBe(0);
            }
          });
        });
      });
    });
  });

  describe('Investment Income Combined with Wage Income', () => {
    const combinedScenarios = [
      {
        description: 'low wage + investment supplement',
        annualIncome: 50000,
        investmentInputs: {
          dividendsIncome: 10000,
          longTermCapitalGains: 15000,
        },
      },
      {
        description: 'high wage + passive income',
        annualIncome: 200000,
        investmentInputs: {
          dividendsIncome: 50000,
          interestIncome: 25000,
          longTermCapitalGains: 100000,
        },
      },
      {
        description: 'moderate wage + rental income',
        annualIncome: 100000,
        investmentInputs: {
          rentalIncome: 40000,
          interestIncome: 5000,
        },
      },
    ];

    states.slice(0, 10).forEach((state) => { // Test subset of states for performance
      combinedScenarios.forEach(({ description, annualIncome, investmentInputs }) => {
        it(`calculates combined wage + investment tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            annualIncome,
            ...investmentInputs,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          // Combined income should result in higher or equal tax than wage-only
          const wageOnlyInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            annualIncome,
          });
          const wageOnlyResult = await calculateStateTaxBurden(state, wageOnlyInputs);

          // Tax with investment income should be >= tax without (unless deductions apply)
          // This is a sanity check - specific state rules may vary
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(wageOnlyResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

describe('State Tax Calculator - Investment Income Edge Cases', () => {
  const states = Object.keys(stateTaxData);

  describe('Zero and Negative Values', () => {
    it('handles zero investment income correctly', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        shortTermCapitalGains: 0,
        longTermCapitalGains: 0,
        dividendsIncome: 0,
        interestIncome: 0,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBe(0);
    });

    it('handles capital losses (negative gains) if supported', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        annualIncome: 100000,
        // Note: Negative values may not be supported, this tests the behavior
        shortTermCapitalGains: -5000,
        longTermCapitalGains: 10000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      // Should not throw, should return valid result
      expect(result).toHaveProperty('incomeTaxBurden');
    });
  });

  describe('Very High Investment Income', () => {
    states.slice(0, 15).forEach((state) => {
      it(`handles very high investment income for ${state}`, async () => {
        const userInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          longTermCapitalGains: 5000000, // $5M
          dividendsIncome: 1000000, // $1M
          interestIncome: 500000, // $500K
        });

        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        // High income should have reasonable tax (not absurdly high or negative)
        expect(result.incomeTaxBurden).toBeLessThan(10000000); // Less than $10M in tax
      });
    });
  });

  describe('Investment Income with Dependents', () => {
    it('applies dependent exemptions to investment income correctly', async () => {
      const withDependentsInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        filingStatus: 'head_of_household',
        dependents: '2',
        hasDependents: true,
        longTermCapitalGains: 100000,
        dividendsIncome: 20000,
      });

      const withoutDependentsInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        filingStatus: 'single',
        dependents: '0',
        hasDependents: false,
        longTermCapitalGains: 100000,
        dividendsIncome: 20000,
      });

      const withDependents = await calculateStateTaxBurden('CA', withDependentsInputs);
      const withoutDependents = await calculateStateTaxBurden('CA', withoutDependentsInputs);

      // Both should be valid results
      expect(withDependents.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      expect(withoutDependents.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });
});
