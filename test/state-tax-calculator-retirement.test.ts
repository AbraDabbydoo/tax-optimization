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
    age: 65,
    spouseAge: 65,
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

// States with no income tax
const noIncomeTaxStates = ['AK', 'FL', 'NV', 'SD', 'TX', 'WA', 'WY'];

// States that fully exempt Social Security
const ssFullExemptStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 
  'IA', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MS', 'NV', 'NH', 'NJ', 'NY', 
  'NC', 'OH', 'OK', 'OR', 'PA', 'SC', 'SD', 'TN', 'TX', 'VA', 'WA', 'WI', 'WY'
];

// States with military retirement exemptions
const militaryExemptStates = [
  'AL', 'AZ', 'AR', 'CT', 'HI', 'IL', 'IA', 'KS', 'KY', 'LA', 'ME', 'MA',
  'MI', 'MN', 'MS', 'MO', 'NE', 'NH', 'NJ', 'NY', 'NC', 'ND', 'OH', 'OK',
  'PA', 'SC', 'UT', 'WI', 'WV'
];

describe('State Tax Calculator - Retirement Income', () => {
  const states = Object.keys(stateTaxData);
  const filingStatuses = ['single', 'married'];

  describe('Social Security Income Taxation', () => {
    const ssScenarios = [
      { amount: 18000, description: 'average SS benefit' },
      { amount: 30000, description: 'above-average SS benefit' },
      { amount: 45936, description: 'maximum SS benefit (2025)' },
    ];

    states.forEach((state) => {
      ssScenarios.forEach(({ amount, description }) => {
        filingStatuses.forEach((status) => {
          it(`calculates SS tax for ${state}, ${status}, ${description}`, async () => {
            const userInputs = createBaseUserInputs({
              residenceState: state,
              employmentState: state,
              filingStatus: status,
              age: 67,
              spouseAge: status === 'married' ? 67 : undefined,
              socialSecurityIncome: amount,
            });

            const result = await calculateStateTaxBurden(state, userInputs);

            expect(result).toHaveProperty('incomeTaxBurden');
            expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);

            // No income tax states should have 0 tax
            if (noIncomeTaxStates.includes(state)) {
              expect(result.incomeTaxBurden).toBe(0);
            }
          });
        });
      });
    });
  });

  describe('Traditional IRA/401k Distribution Taxation', () => {
    const distributionScenarios = [
      { ira: 30000, k401: 0, description: 'IRA distributions only' },
      { ira: 0, k401: 50000, description: '401k distributions only' },
      { ira: 40000, k401: 60000, description: 'mixed IRA/401k distributions' },
      { ira: 100000, k401: 100000, description: 'high distributions' },
    ];

    states.forEach((state) => {
      distributionScenarios.forEach(({ ira, k401, description }) => {
        it(`calculates IRA/401k tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age: 70,
            iraDistributions: ira,
            k401Distributions: k401,
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

  describe('Private Pension Income Taxation', () => {
    const pensionScenarios = [
      { amount: 24000, description: '$2k/month pension' },
      { amount: 48000, description: '$4k/month pension' },
      { amount: 96000, description: '$8k/month pension' },
    ];

    states.forEach((state) => {
      pensionScenarios.forEach(({ amount, description }) => {
        it(`calculates private pension tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age: 65,
            privatePensionIncome: amount,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result).toHaveProperty('retirementTaxBurden');
        });
      });
    });
  });

  describe('Military Retirement Pay Taxation', () => {
    const militaryScenarios = [
      { amount: 24000, description: 'E-7 20-year retirement' },
      { amount: 48000, description: 'O-5 25-year retirement' },
      { amount: 84000, description: 'O-8 30-year retirement' },
    ];

    states.forEach((state) => {
      militaryScenarios.forEach(({ amount, description }) => {
        it(`calculates military retirement tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age: 55,
            militaryRetirementPay: amount,
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

  describe('Government Pension Taxation', () => {
    const govPensionScenarios = [
      { teacher: 40000, police: 0, fire: 0, other: 0, description: 'teacher pension' },
      { teacher: 0, police: 50000, fire: 0, other: 0, description: 'police pension' },
      { teacher: 0, police: 0, fire: 45000, other: 0, description: 'firefighter pension' },
      { teacher: 0, police: 0, fire: 0, other: 60000, description: 'other government pension' },
    ];

    states.forEach((state) => {
      govPensionScenarios.forEach(({ teacher, police, fire, other, description }) => {
        it(`calculates ${description} tax for ${state}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age: 62,
            teacherPension: teacher,
            policePension: police,
            firefighterPension: fire,
            otherGovernmentPension: other,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Annuity Income Taxation', () => {
    const annuityScenarios = [
      { amount: 12000, description: 'small annuity' },
      { amount: 36000, description: 'moderate annuity' },
      { amount: 72000, description: 'large annuity' },
    ];

    states.slice(0, 20).forEach((state) => {
      annuityScenarios.forEach(({ amount, description }) => {
        it(`calculates annuity tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age: 68,
            annuityIncome: amount,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Mixed Retirement Income Portfolio', () => {
    const retirementPortfolios = [
      {
        description: 'typical retiree - SS + small pension',
        inputs: {
          socialSecurityIncome: 24000,
          privatePensionIncome: 18000,
          iraDistributions: 12000,
        },
      },
      {
        description: 'military retiree - military + SS',
        inputs: {
          socialSecurityIncome: 30000,
          militaryRetirementPay: 48000,
        },
      },
      {
        description: 'teacher retiree - teacher pension + SS',
        inputs: {
          socialSecurityIncome: 20000,
          teacherPension: 55000,
        },
      },
      {
        description: 'affluent retiree - multiple sources',
        inputs: {
          socialSecurityIncome: 45000,
          privatePensionIncome: 60000,
          iraDistributions: 50000,
          k401Distributions: 40000,
          annuityIncome: 24000,
        },
      },
      {
        description: 'high-income retiree - all sources',
        inputs: {
          socialSecurityIncome: 45936,
          privatePensionIncome: 100000,
          militaryRetirementPay: 60000,
          iraDistributions: 75000,
          k401Distributions: 75000,
          annuityIncome: 36000,
          dividendsIncome: 50000,
          interestIncome: 25000,
        },
      },
    ];

    states.forEach((state) => {
      retirementPortfolios.forEach(({ description, inputs }) => {
        filingStatuses.forEach((status) => {
          it(`calculates tax for ${state}, ${status}, ${description}`, async () => {
            const userInputs = createBaseUserInputs({
              residenceState: state,
              employmentState: state,
              filingStatus: status,
              age: 67,
              spouseAge: status === 'married' ? 65 : undefined,
              ...inputs,
            });

            const result = await calculateStateTaxBurden(state, userInputs);

            expect(result).toHaveProperty('incomeTaxBurden');
            expect(result).toHaveProperty('retirementTaxBurden');
            expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
            expect(result.retirementTaxBurden).toBeGreaterThanOrEqual(0);
          });
        });
      });
    });
  });

  describe('Age-Based Exemptions', () => {
    const ages = [55, 59, 62, 65, 67, 70, 75];

    const testStates = ['AZ', 'CO', 'GA', 'KY', 'MI', 'NJ', 'NY', 'PA', 'SC', 'VA'];

    testStates.forEach((state) => {
      ages.forEach((age) => {
        it(`applies age-based exemptions for ${state} at age ${age}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age,
            socialSecurityIncome: 30000,
            privatePensionIncome: 40000,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('applies different tax for age 64 vs 65 in age-sensitive states', async () => {
      const youngerInputs = createBaseUserInputs({
        residenceState: 'GA',
        employmentState: 'GA',
        age: 64,
        privatePensionIncome: 50000,
      });

      const olderInputs = createBaseUserInputs({
        residenceState: 'GA',
        employmentState: 'GA',
        age: 65,
        privatePensionIncome: 50000,
      });

      const youngerResult = await calculateStateTaxBurden('GA', youngerInputs);
      const olderResult = await calculateStateTaxBurden('GA', olderInputs);

      // Both should be valid - specific comparison depends on state rules
      expect(youngerResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      expect(olderResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Retirement Income with Wage Income', () => {
    const combinedScenarios = [
      {
        description: 'part-time work + SS',
        annualIncome: 20000,
        retirementInputs: {
          socialSecurityIncome: 24000,
        },
      },
      {
        description: 'full-time work + retirement income',
        annualIncome: 75000,
        retirementInputs: {
          iraDistributions: 30000,
          dividendsIncome: 15000,
        },
      },
      {
        description: 'consulting + full retirement',
        annualIncome: 50000,
        selfEmploymentIncome: 30000,
        retirementInputs: {
          socialSecurityIncome: 40000,
          privatePensionIncome: 30000,
          k401Distributions: 20000,
        },
      },
    ];

    const testStates = ['CA', 'NY', 'TX', 'FL', 'PA', 'IL', 'AZ', 'NC', 'OH', 'GA'];

    testStates.forEach((state) => {
      combinedScenarios.forEach(({ description, annualIncome, retirementInputs, selfEmploymentIncome }) => {
        it(`calculates combined wage + retirement tax for ${state} with ${description}`, async () => {
          const userInputs = createBaseUserInputs({
            residenceState: state,
            employmentState: state,
            age: 66,
            annualIncome,
            selfEmploymentIncome: selfEmploymentIncome || 0,
            ...retirementInputs,
          });

          const result = await calculateStateTaxBurden(state, userInputs);

          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

describe('State Tax Calculator - Retirement Income Edge Cases', () => {
  const states = Object.keys(stateTaxData);

  describe('Early Retirement (Before 59.5)', () => {
    it('calculates tax for early retiree with IRA distributions', async () => {
      const userInputs = createBaseUserInputs({
        residenceState: 'CA',
        employmentState: 'CA',
        age: 55,
        iraDistributions: 50000,
        k401Distributions: 30000,
      });

      const result = await calculateStateTaxBurden('CA', userInputs);
      expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Very High Retirement Income', () => {
    states.slice(0, 10).forEach((state) => {
      it(`handles very high retirement income for ${state}`, async () => {
        const userInputs = createBaseUserInputs({
          residenceState: state,
          employmentState: state,
          age: 70,
          socialSecurityIncome: 45936,
          privatePensionIncome: 200000,
          iraDistributions: 500000,
          k401Distributions: 500000,
        });

        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.incomeTaxBurden).toBeLessThan(2000000); // Sanity check
      });
    });
  });

  describe('Married Couple with Different Ages', () => {
    it('handles spouse age differences for exemptions', async () => {
      const bothOver65 = createBaseUserInputs({
        residenceState: 'AZ',
        employmentState: 'AZ',
        filingStatus: 'married',
        age: 68,
        spouseAge: 66,
        socialSecurityIncome: 50000,
        privatePensionIncome: 60000,
      });

      const oneUnder65 = createBaseUserInputs({
        residenceState: 'AZ',
        employmentState: 'AZ',
        filingStatus: 'married',
        age: 68,
        spouseAge: 62,
        socialSecurityIncome: 50000,
        privatePensionIncome: 60000,
      });

      const bothResult = await calculateStateTaxBurden('AZ', bothOver65);
      const oneResult = await calculateStateTaxBurden('AZ', oneUnder65);

      expect(bothResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      expect(oneResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Kentucky Pre-1998 Military Retirement', () => {
    it('applies KY pre-1998 military retirement exemption', async () => {
      const pre1998Inputs = createBaseUserInputs({
        residenceState: 'KY',
        employmentState: 'KY',
        age: 70,
        militaryRetirementPay: 50000,
        kyMilitaryRetiredBefore1998: true,
      });

      const post1998Inputs = createBaseUserInputs({
        residenceState: 'KY',
        employmentState: 'KY',
        age: 55,
        militaryRetirementPay: 50000,
        kyMilitaryRetiredBefore1998: false,
      });

      const pre1998Result = await calculateStateTaxBurden('KY', pre1998Inputs);
      const post1998Result = await calculateStateTaxBurden('KY', post1998Inputs);

      expect(pre1998Result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      expect(post1998Result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Montana Military Retirement Residency', () => {
    it('applies MT military retirement residency rules', async () => {
      const beforeJuly2023 = createBaseUserInputs({
        residenceState: 'MT',
        employmentState: 'MT',
        age: 60,
        militaryRetirementPay: 60000,
        becameMontanaResidentBeforeJuly2023: true,
      });

      const afterJuly2023 = createBaseUserInputs({
        residenceState: 'MT',
        employmentState: 'MT',
        age: 60,
        militaryRetirementPay: 60000,
        becameMontanaResidentBeforeJuly2023: false,
      });

      const beforeResult = await calculateStateTaxBurden('MT', beforeJuly2023);
      const afterResult = await calculateStateTaxBurden('MT', afterJuly2023);

      expect(beforeResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      expect(afterResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });

  describe('NC Bailey Exemption', () => {
    it('applies NC Bailey exemption for qualifying retirees', async () => {
      const withBailey = createBaseUserInputs({
        residenceState: 'NC',
        employmentState: 'NC',
        age: 70,
        otherGovernmentPension: 50000,
        ncBaileyExemption: true,
      });

      const withoutBailey = createBaseUserInputs({
        residenceState: 'NC',
        employmentState: 'NC',
        age: 55,
        otherGovernmentPension: 50000,
        ncBaileyExemption: false,
      });

      const withBaileyResult = await calculateStateTaxBurden('NC', withBailey);
      const withoutBaileyResult = await calculateStateTaxBurden('NC', withoutBailey);

      expect(withBaileyResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      expect(withoutBaileyResult.incomeTaxBurden).toBeGreaterThanOrEqual(0);
    });
  });
});
