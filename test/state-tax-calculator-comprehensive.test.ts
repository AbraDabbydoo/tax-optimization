import { calculateStateTaxBurden } from '../lib/tax-calculator';
import * as fs from 'fs';
import * as path from 'path';

// Load per-state JSON files from public/updated-tax-data/2025/ (same source as calculator)
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
const states = Object.keys(stateTaxData);

// Base user inputs template
const baseInputs = {
  residenceState: '',
  employmentState: '',
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
};

// States with no income tax
const noIncomeTaxStates = ['AK', 'FL', 'NV', 'SD', 'TX', 'WA', 'WY', 'TN', 'NH'];

// States that exempt Social Security income
const socialSecurityExemptStates = [
  'AL', 'AZ', 'AR', 'CA', 'DE', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KY', 'LA', 
  'ME', 'MD', 'MA', 'MI', 'MS', 'NJ', 'NY', 'NC', 'OH', 'OK', 'OR', 'PA', 'SC', 'VA', 'WI'
];

describe('State Tax Calculator - Investment Income', () => {
  const investmentScenarios = [
    { name: 'Dividends Only', overrides: { dividendsIncome: 25000 } },
    { name: 'Interest Income', overrides: { interestIncome: 15000 } },
    { name: 'Long-term Capital Gains', overrides: { longTermCapitalGains: 50000 } },
    { name: 'Short-term Capital Gains', overrides: { shortTermCapitalGains: 30000 } },
    { name: 'Mixed Investment Income', overrides: { 
      dividendsIncome: 10000, 
      interestIncome: 5000, 
      longTermCapitalGains: 25000,
      shortTermCapitalGains: 10000 
    }},
    { name: 'High Investment Income', overrides: { 
      dividendsIncome: 50000, 
      longTermCapitalGains: 100000,
      interestIncome: 20000 
    }},
  ];

  describe('Smoke Tests - All States Handle Investment Income', () => {
    states.forEach((state) => {
      investmentScenarios.forEach((scenario) => {
        it(`${state} handles ${scenario.name} without errors`, async () => {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            ...scenario.overrides,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
          expect(Number.isFinite(result.totalTaxBurden)).toBe(true);
        });
      });
    });
  });

  describe('No Income Tax States - Investment Income', () => {
    noIncomeTaxStates.forEach((state) => {
      if (!states.includes(state)) return; // Skip if state not in data
      
      it(`${state} returns 0 income tax on investment income`, async () => {
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          dividendsIncome: 50000,
          longTermCapitalGains: 100000,
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.incomeTaxBurden).toBe(0);
      });
    });
  });
});

describe('State Tax Calculator - Retirement Income', () => {
  const retirementScenarios = [
    { name: 'Social Security Only', overrides: { socialSecurityIncome: 30000, age: 67 } },
    { name: 'Private Pension', overrides: { privatePensionIncome: 40000, age: 65 } },
    { name: 'IRA Distributions', overrides: { iraDistributions: 50000, age: 70 } },
    { name: '401k Distributions', overrides: { k401Distributions: 60000, age: 68 } },
    { name: 'Military Retirement', overrides: { militaryRetirementPay: 45000, age: 55 } },
    { name: 'Teacher Pension', overrides: { teacherPension: 35000, age: 62 } },
    { name: 'Police/Fire Pension', overrides: { policePension: 50000, firefighterPension: 0, age: 55 } },
    { name: 'Mixed Retirement Income', overrides: { 
      socialSecurityIncome: 24000, 
      privatePensionIncome: 30000, 
      iraDistributions: 20000,
      age: 70 
    }},
    { name: 'High Retirement Income', overrides: { 
      socialSecurityIncome: 40000, 
      privatePensionIncome: 60000, 
      k401Distributions: 50000,
      iraDistributions: 30000,
      age: 72 
    }},
  ];

  describe('Smoke Tests - All States Handle Retirement Income', () => {
    states.forEach((state) => {
      retirementScenarios.forEach((scenario) => {
        it(`${state} handles ${scenario.name} without errors`, async () => {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            ...scenario.overrides,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
          expect(result.retirementTaxBurden).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
          expect(Number.isFinite(result.retirementTaxBurden)).toBe(true);
        });
      });
    });
  });

  describe('Social Security Exemption States', () => {
    socialSecurityExemptStates.forEach((state) => {
      if (!states.includes(state)) return;
      
      it(`${state} should tax SS less than or equal to wage income`, async () => {
        const ssOnlyInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          socialSecurityIncome: 40000,
          age: 67,
        };
        const wageInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 40000,
        };
        
        const ssResult = await calculateStateTaxBurden(state, ssOnlyInputs);
        const wageResult = await calculateStateTaxBurden(state, wageInputs);
        
        // SS income should result in less or equal total income+retirement tax than wage income
        const ssTotalIncomeTax = ssResult.incomeTaxBurden + ssResult.retirementTaxBurden;
        expect(ssTotalIncomeTax).toBeLessThanOrEqual(wageResult.incomeTaxBurden + 1); // +1 for rounding
      });
    });
  });

  describe('No Income Tax States - Retirement Income', () => {
    noIncomeTaxStates.forEach((state) => {
      if (!states.includes(state)) return;
      
      it(`${state} returns 0 income/retirement tax`, async () => {
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          socialSecurityIncome: 30000,
          privatePensionIncome: 40000,
          iraDistributions: 25000,
          age: 68,
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.incomeTaxBurden).toBe(0);
        expect(result.retirementTaxBurden).toBe(0);
      });
    });
  });
});

describe('State Tax Calculator - Property Tax', () => {
  const propertyScenarios = [
    { name: 'Modest Home', overrides: { homeValue: 250000, propertyTax: 3000, futurePlans: 'stay' } },
    { name: 'Average Home', overrides: { homeValue: 400000, propertyTax: 5000, futurePlans: 'stay' } },
    { name: 'Expensive Home', overrides: { homeValue: 750000, propertyTax: 12000, futurePlans: 'stay' } },
    { name: 'Luxury Home', overrides: { homeValue: 1500000, propertyTax: 25000, futurePlans: 'stay' } },
    { name: 'Future Home Purchase', overrides: { futurePlans: 'buy', housingBudget: 500000 } },
  ];

  describe('Smoke Tests - All States Handle Property', () => {
    states.forEach((state) => {
      propertyScenarios.forEach((scenario) => {
        it(`${state} handles ${scenario.name} without errors`, async () => {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            annualIncome: 100000,
            ...scenario.overrides,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(result.propertyTaxBurden)).toBe(true);
        });
      });
    });
  });

  describe('Property Tax Calculation Accuracy', () => {
    states.forEach((state) => {
      it(`${state} uses actual property tax when provided for home state`, async () => {
        const actualPropertyTax = 8000;
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 100000,
          homeValue: 400000,
          propertyTax: actualPropertyTax,
          futurePlans: 'stay',
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        
        // For home state, should use actual property tax provided
        expect(result.propertyTaxBurden).toBe(actualPropertyTax);
      });
    });
  });

  describe('Renter Scenarios', () => {
    const rentScenarios = [
      { name: 'Low Rent', monthlyRent: 1000 },
      { name: 'Medium Rent', monthlyRent: 2000 },
      { name: 'High Rent', monthlyRent: 3500 },
    ];

    states.forEach((state) => {
      rentScenarios.forEach((scenario) => {
        it(`${state} handles renter with ${scenario.name}`, async () => {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            annualIncome: 75000,
            monthlyRent: scenario.monthlyRent,
            homeValue: 0,
            propertyTax: 0,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          // Renters should have 0 property tax burden
          expect(result.propertyTaxBurden).toBe(0);
          expect(Number.isFinite(result.totalTaxBurden)).toBe(true);
        });
      });
    });
  });
});

describe('State Tax Calculator - Sales Tax (Monthly Expenses)', () => {
  describe('Smoke Tests - All States Handle Sales Tax', () => {
    const incomeScenarios = [
      { name: 'Low Income', annualIncome: 35000 },
      { name: 'Middle Income', annualIncome: 75000 },
      { name: 'High Income', annualIncome: 200000 },
    ];

    states.forEach((state) => {
      incomeScenarios.forEach((scenario) => {
        it(`${state} calculates sales tax for ${scenario.name}`, async () => {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            annualIncome: scenario.annualIncome,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(result.salesTaxBurden)).toBe(true);
        });
      });
    });
  });

  describe('No Sales Tax States', () => {
    const noSalesTaxStates = ['DE', 'MT', 'NH', 'OR'];
    
    noSalesTaxStates.forEach((state) => {
      if (!states.includes(state)) return;
      
      it(`${state} returns 0 or minimal sales tax`, async () => {
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 100000,
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        // These states have no or very low sales tax
        expect(result.salesTaxBurden).toBeLessThanOrEqual(100); // Allow small local taxes
      });
    });
  });

  describe('Sales Tax Proportionality', () => {
    states.forEach((state) => {
      it(`${state} - higher income should result in higher or equal sales tax`, async () => {
        const lowIncomeInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 50000,
        };
        const highIncomeInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 150000,
        };
        
        const lowResult = await calculateStateTaxBurden(state, lowIncomeInputs);
        const highResult = await calculateStateTaxBurden(state, highIncomeInputs);
        
        expect(highResult.salesTaxBurden).toBeGreaterThanOrEqual(lowResult.salesTaxBurden);
      });
    });
  });
});

describe('State Tax Calculator - Mixed Income Scenarios', () => {
  const mixedScenarios = [
    {
      name: 'Young Professional with Investments',
      overrides: {
        age: 35,
        annualIncome: 120000,
        dividendsIncome: 5000,
        longTermCapitalGains: 10000,
        homeValue: 350000,
        propertyTax: 4500,
      }
    },
    {
      name: 'Early Retiree',
      overrides: {
        age: 58,
        annualIncome: 0,
        iraDistributions: 60000,
        dividendsIncome: 20000,
        longTermCapitalGains: 15000,
        homeValue: 500000,
        propertyTax: 7000,
      }
    },
    {
      name: 'Full Retiree with Mixed Income',
      overrides: {
        age: 70,
        socialSecurityIncome: 30000,
        privatePensionIncome: 40000,
        iraDistributions: 25000,
        dividendsIncome: 15000,
        interestIncome: 5000,
        homeValue: 400000,
        propertyTax: 5500,
      }
    },
    {
      name: 'Military Retiree',
      overrides: {
        age: 55,
        militaryRetirementPay: 50000,
        annualIncome: 40000, // Part-time work
        homeValue: 300000,
        propertyTax: 3500,
      }
    },
    {
      name: 'Teacher Retiree',
      overrides: {
        age: 65,
        teacherPension: 45000,
        socialSecurityIncome: 20000,
        iraDistributions: 10000,
        homeValue: 350000,
        propertyTax: 4000,
      }
    },
    {
      name: 'Self-Employed with Rental Income',
      overrides: {
        age: 45,
        selfEmploymentIncome: 100000,
        rentalIncome: 24000,
        dividendsIncome: 8000,
        homeValue: 600000,
        propertyTax: 9000,
      }
    },
    {
      name: 'High Net Worth Retiree',
      overrides: {
        age: 72,
        socialSecurityIncome: 45000,
        privatePensionIncome: 80000,
        k401Distributions: 100000,
        dividendsIncome: 75000,
        longTermCapitalGains: 50000,
        interestIncome: 25000,
        homeValue: 1200000,
        propertyTax: 18000,
      }
    },
    {
      name: 'Married Couple Both Working',
      overrides: {
        filingStatus: 'married',
        age: 45,
        spouseAge: 43,
        annualIncome: 180000,
        dividendsIncome: 10000,
        homeValue: 550000,
        propertyTax: 7500,
      }
    },
    {
      name: 'Married Retirees',
      overrides: {
        filingStatus: 'married',
        age: 68,
        spouseAge: 66,
        socialSecurityIncome: 55000,
        privatePensionIncome: 45000,
        iraDistributions: 40000,
        dividendsIncome: 20000,
        homeValue: 450000,
        propertyTax: 6000,
      }
    },
    {
      name: 'Head of Household with Dependents',
      overrides: {
        filingStatus: 'head_of_household',
        age: 42,
        annualIncome: 85000,
        dependents: '2',
        hasDependents: true,
        homeValue: 320000,
        propertyTax: 4200,
      }
    },
  ];

  describe('Smoke Tests - All States Handle Mixed Scenarios', () => {
    states.forEach((state) => {
      mixedScenarios.forEach((scenario) => {
        it(`${state} handles ${scenario.name} without errors`, async () => {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            ...scenario.overrides,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
          expect(Number.isFinite(result.retirementTaxBurden)).toBe(true);
          expect(Number.isFinite(result.propertyTaxBurden)).toBe(true);
          expect(Number.isFinite(result.salesTaxBurden)).toBe(true);
          expect(Number.isFinite(result.totalTaxBurden)).toBe(true);
          expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

describe('State Tax Calculator - Consistency Checks', () => {
  describe('Monotonicity - More Income = More Tax', () => {
    states.forEach((state) => {
      it(`${state} - higher wage income should not result in lower tax`, async () => {
        const lowIncome = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 50000,
        };
        const highIncome = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 150000,
        };
        
        const lowResult = await calculateStateTaxBurden(state, lowIncome);
        const highResult = await calculateStateTaxBurden(state, highIncome);
        
        expect(highResult.incomeTaxBurden).toBeGreaterThanOrEqual(lowResult.incomeTaxBurden);
      });
    });
  });

  describe('Zero Income = Zero Income Tax', () => {
    states.forEach((state) => {
      it(`${state} returns 0 income tax for zero income`, async () => {
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 0,
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        expect(result.incomeTaxBurden).toBe(0);
      });
    });
  });

  describe('Very High Income Handling', () => {
    states.forEach((state) => {
      it(`${state} handles very high income without errors`, async () => {
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 10000000,
          dividendsIncome: 500000,
          longTermCapitalGains: 1000000,
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        
        expect(result).toBeDefined();
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe('State Tax Calculator - Edge Cases', () => {
  describe('Age-Based Exemptions', () => {
    // States that don't have senior-specific retirement income exemptions
    // These states tax retirement income the same regardless of age, or their
    // exemptions apply differently than a simple age-based comparison
    const statesWithoutSeniorExemptions = [
      'AL', 'AZ', 'ID', 'KS', 'MO', 'NC', // States with complex exemption rules
      'OR', 'UT', 'VT', 'WI', 'MN', 'CA', 'NE', 'ND', 'MT', 'NM', 'WV' // States without senior exemptions
    ];
    
    states.filter(s => !statesWithoutSeniorExemptions.includes(s)).forEach((state) => {
      it(`${state} - senior (65+) with retirement income gets favorable treatment`, async () => {
        const seniorInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          age: 67,
          privatePensionIncome: 50000,
        };
        const nonSeniorInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          age: 50,
          annualIncome: 50000,
        };
        
        const seniorResult = await calculateStateTaxBurden(state, seniorInputs);
        const nonSeniorResult = await calculateStateTaxBurden(state, nonSeniorInputs);
        
        // Most states give seniors some benefit - at worst equal, usually less
        const seniorTotalIncomeTax = seniorResult.incomeTaxBurden + seniorResult.retirementTaxBurden;
        // Allow a small margin for states that don't have senior exemptions
        expect(seniorTotalIncomeTax).toBeLessThanOrEqual(nonSeniorResult.incomeTaxBurden + 100);
      });
    });
  });

  describe('Filing Status Differences', () => {
    const filingStatuses = ['single', 'married', 'head_of_household'];
    
    states.forEach((state) => {
      it(`${state} handles all filing statuses`, async () => {
        for (const status of filingStatuses) {
          const userInputs = {
            ...baseInputs,
            residenceState: state,
            employmentState: state,
            filingStatus: status,
            annualIncome: 100000,
          };
          
          const result = await calculateStateTaxBurden(state, userInputs);
          
          expect(result).toBeDefined();
          expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
        }
      });
    });
  });

  describe('Vehicle Tax', () => {
    states.forEach((state) => {
      it(`${state} calculates vehicle tax without errors`, async () => {
        const userInputs = {
          ...baseInputs,
          residenceState: state,
          employmentState: state,
          annualIncome: 75000,
          vehicleCount: 2,
          vehicleValue: 35000,
        };
        
        const result = await calculateStateTaxBurden(state, userInputs);
        
        expect(result).toBeDefined();
        expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(result.vehicleTaxBurden)).toBe(true);
      });
    });
  });
});
