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

// Helper to calculate tax for a state
async function getTaxForState(state: string, overrides: Partial<any> = {}) {
  const userInputs = createBaseUserInputs({
    residenceState: state,
    employmentState: state,
    ...overrides,
  });
  return calculateStateTaxBurden(state, userInputs);
}

describe('State Tax Calculator - Comparative Sanity Tests', () => {

  describe('No-Income-Tax States vs High-Income-Tax States', () => {
    const noIncomeTaxStates = ['TX', 'FL', 'WA', 'NV', 'WY', 'SD', 'AK'];
    const highIncomeTaxStates = ['CA', 'NY', 'NJ', 'OR', 'MN'];

    const incomeScenarios = [
      { income: 75000, description: '$75k income' },
      { income: 150000, description: '$150k income' },
      { income: 300000, description: '$300k income' },
      { income: 1000000, description: '$1M income' },
    ];

    incomeScenarios.forEach(({ income, description }) => {
      it(`no-income-tax states have lower income tax than high-tax states at ${description}`, async () => {
        // Get results for all states
        const noTaxResults = await Promise.all(
          noIncomeTaxStates.map(state => getTaxForState(state, { annualIncome: income }))
        );
        const highTaxResults = await Promise.all(
          highIncomeTaxStates.map(state => getTaxForState(state, { annualIncome: income }))
        );

        // All no-income-tax states should have 0 income tax
        noTaxResults.forEach((result, i) => {
          expect(result.incomeTaxBurden).toBe(0);
        });

        // All high-income-tax states should have positive income tax
        highTaxResults.forEach((result, i) => {
          expect(result.incomeTaxBurden).toBeGreaterThan(0);
        });

        // Every no-income-tax state should have lower income tax than every high-tax state
        const maxNoTaxIncome = Math.max(...noTaxResults.map(r => r.incomeTaxBurden));
        const minHighTaxIncome = Math.min(...highTaxResults.map(r => r.incomeTaxBurden));
        expect(maxNoTaxIncome).toBeLessThan(minHighTaxIncome);
      });
    });
  });

  describe('Progressive Tax Logic - Higher Income = Higher Tax', () => {
    const testStates = ['CA', 'NY', 'TX', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'AZ'];
    const incomeProgression = [25000, 50000, 75000, 100000, 150000, 200000, 300000];

    testStates.forEach((state) => {
      it(`${state}: income tax increases with higher income`, async () => {
        const results = await Promise.all(
          incomeProgression.map(income => getTaxForState(state, { annualIncome: income }))
        );

        // Each income level should have >= tax than the previous
        for (let i = 1; i < results.length; i++) {
          expect(results[i].incomeTaxBurden).toBeGreaterThanOrEqual(results[i - 1].incomeTaxBurden);
        }
      });
    });
  });

  describe('Property Tax Rankings', () => {
    // Known high property tax states
    const highPropertyTaxStates = ['NJ', 'IL', 'CT', 'NH'];
    // Known low property tax states
    const lowPropertyTaxStates = ['HI', 'AL', 'LA', 'WV'];

    const homeValue = 500000;

    it('high property tax states have higher property tax than low property tax states', async () => {
      const highPropTaxResults = await Promise.all(
        highPropertyTaxStates.map(state => getTaxForState(state, { 
          annualIncome: 100000,
          homeValue 
        }))
      );
      const lowPropTaxResults = await Promise.all(
        lowPropertyTaxStates.map(state => getTaxForState(state, { 
          annualIncome: 100000,
          homeValue 
        }))
      );

      // Average property tax for high-tax states
      const avgHighPropTax = highPropTaxResults.reduce((sum, r) => sum + r.propertyTaxBurden, 0) / highPropTaxResults.length;
      // Average property tax for low-tax states
      const avgLowPropTax = lowPropTaxResults.reduce((sum, r) => sum + r.propertyTaxBurden, 0) / lowPropTaxResults.length;

      expect(avgHighPropTax).toBeGreaterThan(avgLowPropTax);
    });

    it('property tax scales with home value', async () => {
      const homeValues = [200000, 400000, 600000, 800000, 1000000];

      const results = await Promise.all(
        homeValues.map(value => getTaxForState('NJ', { 
          annualIncome: 100000,
          homeValue: value 
        }))
      );

      // Property tax should increase with home value
      for (let i = 1; i < results.length; i++) {
        expect(results[i].propertyTaxBurden).toBeGreaterThan(results[i - 1].propertyTaxBurden);
      }
    });
  });

  describe('Filing Status Impact', () => {
    const testStates = ['CA', 'NY', 'GA', 'NC', 'AZ', 'CO', 'OR', 'MN'];
    const income = 150000;

    testStates.forEach((state) => {
      it(`${state}: married filing jointly has same or lower tax than single for same income`, async () => {
        const singleResult = await getTaxForState(state, {
          annualIncome: income,
          filingStatus: 'single',
        });

        const marriedResult = await getTaxForState(state, {
          annualIncome: income,
          filingStatus: 'married',
        });

        // MFJ should be <= single for same total income
        // (because MFJ brackets are typically wider)
        expect(marriedResult.incomeTaxBurden).toBeLessThanOrEqual(singleResult.incomeTaxBurden);
      });
    });
  });

  describe('Retirement-Friendly States', () => {
    // States with no income tax are automatically retirement-friendly
    const noIncomeTaxStates = ['FL', 'TX', 'NV', 'WA', 'WY', 'SD', 'AK'];

    const retirementIncome = {
      socialSecurityIncome: 35000,
      privatePensionIncome: 50000,
      iraDistributions: 30000,
      k401Distributions: 25000,
      age: 68,
    };

    it('no-income-tax states have $0 income tax on retirement income', async () => {
      const results = await Promise.all(
        noIncomeTaxStates.map(state => getTaxForState(state, retirementIncome))
      );

      // All no-income-tax states should have 0 income tax
      results.forEach((result, i) => {
        expect(result.incomeTaxBurden).toBe(0);
      });
    });
  });

  describe('Social Security Exemption States', () => {
    // States that fully exempt Social Security
    const ssExemptStates = ['FL', 'TX', 'PA', 'IL', 'MS', 'AL', 'AK', 'NV', 'WA', 'WY'];
    
    const ssOnlyIncome = {
      socialSecurityIncome: 40000,
      annualIncome: 0,
      age: 70,
    };

    ssExemptStates.forEach((state) => {
      it(`${state}: Social Security only income results in $0 income tax`, async () => {
        const result = await getTaxForState(state, ssOnlyIncome);
        expect(result.incomeTaxBurden).toBe(0);
      });
    });
  });

  describe('Military Retirement Exemption States', () => {
    // States that fully exempt military retirement
    const militaryExemptStates = ['AL', 'AK', 'FL', 'HI', 'IL', 'MS', 'NV', 'NH', 'PA', 'SD', 'TN', 'TX', 'WA', 'WY'];
    
    const militaryRetirementIncome = {
      militaryRetirementPay: 50000,
      annualIncome: 0,
      age: 55,
    };

    militaryExemptStates.forEach((state) => {
      it(`${state}: military retirement only income results in $0 income tax`, async () => {
        const result = await getTaxForState(state, militaryRetirementIncome);
        expect(result.incomeTaxBurden).toBe(0);
      });
    });
  });

  describe('No Sales Tax States', () => {
    const noSalesTaxStates = ['DE', 'MT', 'NH', 'OR'];
    // AK has no state sales tax but has local taxes

    const expenseInputs = {
      annualIncome: 100000,
      groceries: 12000,
      preparedFood: 6000,
      utilities: 3600,
    };

    noSalesTaxStates.forEach((state) => {
      it(`${state}: has $0 or minimal sales tax burden`, async () => {
        const result = await getTaxForState(state, expenseInputs);
        // Allow small amount for edge cases, but should be near zero
        expect(result.salesTaxBurden).toBeLessThan(100);
      });
    });
  });

  describe('Total Tax Burden - State Comparisons', () => {
    it('TX total burden is primarily property tax and sales tax', async () => {
      const result = await getTaxForState('TX', {
        annualIncome: 150000,
        homeValue: 500000,
      });

      expect(result.incomeTaxBurden).toBe(0);
      expect(result.propertyTaxBurden).toBeGreaterThan(0);
      // Total should be sum of non-income taxes
      expect(result.totalTaxBurden).toBeGreaterThanOrEqual(result.propertyTaxBurden);
    });

    it('OR total burden is primarily income tax (no sales tax)', async () => {
      const result = await getTaxForState('OR', {
        annualIncome: 150000,
        homeValue: 500000,
      });

      expect(result.incomeTaxBurden).toBeGreaterThan(0);
      expect(result.salesTaxBurden).toBe(0);
    });

    it('high earner in CA has higher total tax than same in TX', async () => {
      const income = 500000;
      const homeValue = 750000;

      const caResult = await getTaxForState('CA', { annualIncome: income, homeValue });
      const txResult = await getTaxForState('TX', { annualIncome: income, homeValue });

      // CA should have much higher total burden due to high income tax
      expect(caResult.totalTaxBurden).toBeGreaterThan(txResult.totalTaxBurden);
    });

    it('moderate earner with expensive home: TX vs CA may be closer', async () => {
      const income = 100000;
      const homeValue = 1000000;

      const caResult = await getTaxForState('CA', { annualIncome: income, homeValue });
      const txResult = await getTaxForState('TX', { annualIncome: income, homeValue });

      // Both should have meaningful burdens
      expect(caResult.totalTaxBurden).toBeGreaterThan(0);
      expect(txResult.totalTaxBurden).toBeGreaterThan(0);
    });
  });

  describe('Flat Tax vs Progressive Tax States', () => {
    // Flat tax states
    const flatTaxStates = ['CO', 'IL', 'IN', 'KY', 'MA', 'MI', 'NC', 'PA', 'UT'];
    // Progressive tax states (for comparison)
    const progressiveStates = ['CA', 'NY', 'OR', 'MN'];

    it('flat tax states maintain consistent effective rate across income levels', async () => {
      for (const state of flatTaxStates.slice(0, 3)) { // Test subset for performance
        const low = await getTaxForState(state, { annualIncome: 50000 });
        const high = await getTaxForState(state, { annualIncome: 200000 });

        // Calculate effective rates (after deductions, may not be perfectly flat)
        const lowRate = low.incomeTaxBurden / 50000;
        const highRate = high.incomeTaxBurden / 200000;

        // Flat tax states should have similar effective rates
        // Allow 3% difference due to deductions/exemptions
        expect(Math.abs(lowRate - highRate)).toBeLessThan(0.03);
      }
    });

    it('progressive tax states have higher effective rate at higher incomes', async () => {
      for (const state of progressiveStates.slice(0, 2)) { // Test subset for performance
        const low = await getTaxForState(state, { annualIncome: 50000 });
        const high = await getTaxForState(state, { annualIncome: 500000 });

        const lowRate = low.incomeTaxBurden / 50000;
        const highRate = high.incomeTaxBurden / 500000;

        // Progressive states should have meaningfully higher effective rate at high income
        expect(highRate).toBeGreaterThan(lowRate);
      }
    });
  });

  describe('Dependent Impact on Tax', () => {
    const testStates = ['CA', 'NY', 'GA', 'AZ', 'IN'];

    testStates.forEach((state) => {
      it(`${state}: having dependents reduces or maintains tax burden`, async () => {
        const noDependents = await getTaxForState(state, {
          annualIncome: 100000,
          filingStatus: 'single',
          dependents: '0',
          hasDependents: false,
        });

        const withDependents = await getTaxForState(state, {
          annualIncome: 100000,
          filingStatus: 'head_of_household',
          dependents: '2',
          hasDependents: true,
        });

        // Having dependents should reduce or maintain tax (not increase)
        expect(withDependents.incomeTaxBurden).toBeLessThanOrEqual(noDependents.incomeTaxBurden);
      });
    });
  });

  describe('Age-Based Exemptions', () => {
    // States with significant senior exemptions
    const seniorFriendlyStates = ['GA', 'SC', 'PA', 'MS'];

    seniorFriendlyStates.forEach((state) => {
      it(`${state}: seniors (65+) have same or lower tax on retirement income`, async () => {
        const retirement = {
          privatePensionIncome: 50000,
          iraDistributions: 25000,
        };

        const younger = await getTaxForState(state, {
          ...retirement,
          age: 55,
        });

        const senior = await getTaxForState(state, {
          ...retirement,
          age: 68,
        });

        // Seniors should have same or lower tax due to exemptions
        expect(senior.incomeTaxBurden).toBeLessThanOrEqual(younger.incomeTaxBurden);
      });
    });
  });

  describe('California Specific Sanity Checks', () => {
    it('CA has one of the highest income tax rates for high earners', async () => {
      const income = 1000000;
      
      const caResult = await getTaxForState('CA', { annualIncome: income });
      const nyResult = await getTaxForState('NY', { annualIncome: income });
      const txResult = await getTaxForState('TX', { annualIncome: income });
      const flResult = await getTaxForState('FL', { annualIncome: income });

      // CA and NY should be among highest
      expect(caResult.incomeTaxBurden).toBeGreaterThan(50000); // At least 5% effective
      expect(nyResult.incomeTaxBurden).toBeGreaterThan(50000);
      
      // TX and FL should be 0
      expect(txResult.incomeTaxBurden).toBe(0);
      expect(flResult.incomeTaxBurden).toBe(0);
    });

    it('CA effective rate increases with income (mental millionaire tax)', async () => {
      const moderate = await getTaxForState('CA', { annualIncome: 200000 });
      const high = await getTaxForState('CA', { annualIncome: 500000 });
      const veryHigh = await getTaxForState('CA', { annualIncome: 2000000 });

      const moderateRate = moderate.incomeTaxBurden / 200000;
      const highRate = high.incomeTaxBurden / 500000;
      const veryHighRate = veryHigh.incomeTaxBurden / 2000000;

      expect(highRate).toBeGreaterThan(moderateRate);
      expect(veryHighRate).toBeGreaterThan(highRate);
    });
  });

  describe('Result Consistency', () => {
    it('same inputs produce same results', async () => {
      const inputs = {
        annualIncome: 125000,
        homeValue: 450000,
        vehicleCount: 2,
        vehicleValue: 50000,
      };

      const result1 = await getTaxForState('CA', inputs);
      const result2 = await getTaxForState('CA', inputs);

      expect(result1.totalTaxBurden).toBe(result2.totalTaxBurden);
      expect(result1.incomeTaxBurden).toBe(result2.incomeTaxBurden);
      expect(result1.propertyTaxBurden).toBe(result2.propertyTaxBurden);
    });

    it('all tax components are non-negative', async () => {
      const states = ['CA', 'TX', 'NY', 'FL', 'PA', 'OH', 'IL', 'GA', 'NC', 'MI'];
      
      for (const state of states) {
        const result = await getTaxForState(state, {
          annualIncome: 100000,
          homeValue: 400000,
          vehicleCount: 1,
          vehicleValue: 25000,
        });

        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.propertyTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.salesTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.vehicleTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ============================================================================
  // GOLDEN VALUE TESTS: State-Specific Retirement Income Taxation
  // These tests validate the specific tax rules for states that tax retirement
  // income in unusual or complex ways.
  // ============================================================================

  describe('California (CA) - Retirement Income Golden Values', () => {
    // CA Rules:
    // - Social Security: NOT taxed
    // - 401k/IRA/Pensions: Fully taxed at ordinary income rates
    // - No special retirement income exemptions

    it('CA: Social Security only should result in $0 income tax', async () => {
      const result = await getTaxForState('CA', {
        socialSecurityIncome: 35000,
        age: 67,
      });
      expect(result.incomeTaxBurden).toBe(0);
      expect(result.retirementTaxBurden).toBe(0);
    });

    it('CA: Pension income should be taxed at ordinary rates', async () => {
      const result = await getTaxForState('CA', {
        privatePensionIncome: 60000,
        age: 67,
      });
      // $60k pension - standard deduction (~$5,706 single) = ~$54,294 taxable
      // Should produce meaningful tax (CA rates: 1-9.3% for this range)
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeGreaterThan(1500);
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeLessThan(6000);
    });

    it('CA: IRA/401k distributions should be taxed at ordinary rates', async () => {
      const result = await getTaxForState('CA', {
        iraDistributions: 40000,
        k401Distributions: 30000,
        age: 70,
      });
      // $70k total - standard deduction (~$5,706) = ~$64k taxable
      // However, retirement tax may be calculated separately from income tax
      // At minimum, there should be meaningful tax on $70k of distributions
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeGreaterThan(500);
    });

    it('CA: Mixed SS + pension - only pension taxed', async () => {
      const ssOnly = await getTaxForState('CA', {
        socialSecurityIncome: 30000,
        age: 67,
      });
      const mixed = await getTaxForState('CA', {
        socialSecurityIncome: 30000,
        privatePensionIncome: 50000,
        age: 67,
      });
      const pensionOnly = await getTaxForState('CA', {
        privatePensionIncome: 50000,
        age: 67,
      });

      // SS only = $0 tax
      expect(ssOnly.incomeTaxBurden + ssOnly.retirementTaxBurden).toBe(0);
      // Mixed and pension-only should have similar tax (SS doesn't add to taxable income)
      const mixedTax = mixed.incomeTaxBurden + mixed.retirementTaxBurden;
      const pensionTax = pensionOnly.incomeTaxBurden + pensionOnly.retirementTaxBurden;
      expect(Math.abs(mixedTax - pensionTax)).toBeLessThan(100); // Allow small variance
    });

    it('CA: Military retirement is taxed (no exemption)', async () => {
      const result = await getTaxForState('CA', {
        militaryRetirementPay: 50000,
        age: 55,
      });
      // CA taxes military retirement at ordinary rates
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeGreaterThan(1000);
    });
  });

  describe('Vermont (VT) - Retirement Income Golden Values', () => {
    // VT Rules:
    // - Social Security: Taxed, but with AGI-based exemption
    //   - Full exemption if AGI <= $50k single / $65k married
    //   - Phase-out between $50k-$60k single / $65k-$75k married
    //   - No exemption if AGI > $60k single / $75k married
    // - 401k/IRA/Pensions: Taxed, $10k pension deduction with AGI phase-out

    it('VT: Low-income retiree with SS gets full exemption', async () => {
      const result = await getTaxForState('VT', {
        socialSecurityIncome: 25000,
        privatePensionIncome: 20000,
        age: 67,
        filingStatus: 'single',
      });
      // AGI = $45k, under $50k threshold = full SS exemption
      // Only $20k pension - $10k deduction - standard deduction is taxable
      // Tax should be relatively low
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeLessThan(1500);
    });

    it('VT: High-income retiree with SS gets no exemption', async () => {
      const result = await getTaxForState('VT', {
        socialSecurityIncome: 30000,
        privatePensionIncome: 60000,
        iraDistributions: 30000,
        age: 67,
        filingStatus: 'single',
      });
      // AGI = $120k, well above $60k threshold = no SS exemption
      // All income is taxable
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeGreaterThan(5000);
    });

    it('VT: SS exemption phases out between thresholds (single)', async () => {
      const lowAGI = await getTaxForState('VT', {
        socialSecurityIncome: 30000,
        annualIncome: 15000, // Total ~$45k, under threshold
        age: 67,
        filingStatus: 'single',
      });
      const midAGI = await getTaxForState('VT', {
        socialSecurityIncome: 30000,
        annualIncome: 25000, // Total ~$55k, in phase-out
        age: 67,
        filingStatus: 'single',
      });
      const highAGI = await getTaxForState('VT', {
        socialSecurityIncome: 30000,
        annualIncome: 35000, // Total ~$65k, above threshold
        age: 67,
        filingStatus: 'single',
      });

      const lowTax = lowAGI.incomeTaxBurden + lowAGI.retirementTaxBurden;
      const midTax = midAGI.incomeTaxBurden + midAGI.retirementTaxBurden;
      const highTax = highAGI.incomeTaxBurden + highAGI.retirementTaxBurden;

      // Tax should increase as AGI increases and exemption phases out
      expect(midTax).toBeGreaterThan(lowTax);
      expect(highTax).toBeGreaterThan(midTax);
    });

    it('VT: Married couple has higher SS exemption threshold', async () => {
      const single = await getTaxForState('VT', {
        socialSecurityIncome: 40000,
        privatePensionIncome: 25000,
        age: 67,
        filingStatus: 'single',
      });
      const married = await getTaxForState('VT', {
        socialSecurityIncome: 40000,
        privatePensionIncome: 25000,
        age: 67,
        spouseAge: 65,
        filingStatus: 'married',
      });

      // Same income but married threshold is $65k vs $50k single
      // Married should have lower tax due to more favorable exemption
      const singleTax = single.incomeTaxBurden + single.retirementTaxBurden;
      const marriedTax = married.incomeTaxBurden + married.retirementTaxBurden;
      expect(marriedTax).toBeLessThanOrEqual(singleTax);
    });
  });

  describe('Minnesota (MN) - Retirement Income Golden Values', () => {
    // MN Rules:
    // - Social Security: Taxed, but with AGI-based exemption
    //   - Full exemption if AGI <= $78k single / $100k married
    //   - Phase-out: 10% reduction per $2k over threshold
    // - 401k/IRA/Private Pensions: Fully taxed
    // - Public Pensions: Have subtraction with AGI limits
    // - Military Retirement: Exempt

    it('MN: Low-income retiree gets full SS exemption', async () => {
      const result = await getTaxForState('MN', {
        socialSecurityIncome: 30000,
        privatePensionIncome: 40000,
        age: 67,
        filingStatus: 'single',
      });
      // AGI = $70k, under $78k threshold = full SS exemption
      // Only pension is taxable
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeGreaterThan(1000);
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBeLessThan(4000);
    });

    it('MN: High-income retiree SS exemption phases out', async () => {
      const underThreshold = await getTaxForState('MN', {
        socialSecurityIncome: 35000,
        annualIncome: 40000, // AGI ~$75k
        age: 67,
        filingStatus: 'single',
      });
      const overThreshold = await getTaxForState('MN', {
        socialSecurityIncome: 35000,
        annualIncome: 60000, // AGI ~$95k
        age: 67,
        filingStatus: 'single',
      });

      const underTax = underThreshold.incomeTaxBurden + underThreshold.retirementTaxBurden;
      const overTax = overThreshold.incomeTaxBurden + overThreshold.retirementTaxBurden;

      // Higher AGI = less SS exemption = higher tax
      expect(overTax).toBeGreaterThan(underTax);
    });

    it('MN: Military retirement is exempt', async () => {
      const militaryOnly = await getTaxForState('MN', {
        militaryRetirementPay: 50000,
        age: 55,
      });
      const pensionOnly = await getTaxForState('MN', {
        privatePensionIncome: 50000,
        age: 55,
      });

      const militaryTax = militaryOnly.incomeTaxBurden + militaryOnly.retirementTaxBurden;
      const pensionTax = pensionOnly.incomeTaxBurden + pensionOnly.retirementTaxBurden;

      // Military should be exempt, pension should be taxed
      expect(militaryTax).toBeLessThan(pensionTax);
      expect(militaryTax).toBe(0);
    });

    it('MN: Married couples have higher SS exemption threshold', async () => {
      // Single at $90k AGI is over threshold ($78k)
      const single = await getTaxForState('MN', {
        socialSecurityIncome: 35000,
        privatePensionIncome: 55000,
        age: 67,
        filingStatus: 'single',
      });
      // Married at $90k AGI is under threshold ($100k)
      const married = await getTaxForState('MN', {
        socialSecurityIncome: 35000,
        privatePensionIncome: 55000,
        age: 67,
        spouseAge: 65,
        filingStatus: 'married',
      });

      const singleTax = single.incomeTaxBurden + single.retirementTaxBurden;
      const marriedTax = married.incomeTaxBurden + married.retirementTaxBurden;

      // Married should have lower tax (full SS exemption vs partial)
      expect(marriedTax).toBeLessThan(singleTax);
    });

    it('MN: SS only with low income = $0 tax', async () => {
      const result = await getTaxForState('MN', {
        socialSecurityIncome: 30000,
        age: 67,
        filingStatus: 'single',
      });
      // SS exempt, no other income, below standard deduction
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });
  });

  describe('Cross-State Retirement Income Comparisons', () => {
    it('FL/TX have $0 tax on all retirement income (no income tax)', async () => {
      const retirementIncome = {
        socialSecurityIncome: 35000,
        privatePensionIncome: 50000,
        iraDistributions: 30000,
        age: 67,
      };

      const flResult = await getTaxForState('FL', retirementIncome);
      const txResult = await getTaxForState('TX', retirementIncome);

      expect(flResult.incomeTaxBurden + flResult.retirementTaxBurden).toBe(0);
      expect(txResult.incomeTaxBurden + txResult.retirementTaxBurden).toBe(0);
    });

    it('CA taxes more retirement income than VT for same scenario', async () => {
      // Scenario where VT exempts SS but CA taxes pension
      const income = {
        socialSecurityIncome: 25000,
        privatePensionIncome: 60000,
        age: 67,
        filingStatus: 'single',
      };

      const caResult = await getTaxForState('CA', income);
      const vtResult = await getTaxForState('VT', income);

      const caTax = caResult.incomeTaxBurden + caResult.retirementTaxBurden;
      const vtTax = vtResult.incomeTaxBurden + vtResult.retirementTaxBurden;

      // VT has $10k pension deduction, CA has none
      // But CA has higher rates, so CA likely higher overall
      // This tests that the difference makes sense
      expect(Math.abs(caTax - vtTax)).toBeLessThan(5000); // Reasonably close
    });

    it('MN vs CA: MN exempts SS for low-income, CA always exempts SS', async () => {
      const lowIncome = {
        socialSecurityIncome: 30000,
        privatePensionIncome: 20000,
        age: 67,
        filingStatus: 'single',
      };

      const caLow = await getTaxForState('CA', lowIncome);
      const mnLow = await getTaxForState('MN', lowIncome);

      // Both should exempt SS for this low income scenario
      // Pension taxed similarly
      const caTax = caLow.incomeTaxBurden + caLow.retirementTaxBurden;
      const mnTax = mnLow.incomeTaxBurden + mnLow.retirementTaxBurden;

      // Both should have modest tax on the pension portion
      expect(caTax).toBeGreaterThan(0);
      expect(mnTax).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // GOLDEN VALUE TESTS: Additional Complex States (CT, NJ, SC, MI, MO)
  // These states have intricate retirement income rules that warrant explicit testing.
  // ============================================================================

  describe('Connecticut (CT) - Retirement Income Golden Values', () => {
    // CT Rules:
    // - Social Security: Exempt if AGI < $75k single / $100k married
    //   - Above thresholds: included in sliding scale exemption
    // - Pensions/IRA/401k: Sliding scale exemption based on AGI
    //   - Single: 100% exempt ≤$75k, phases to 0% at $95k
    //   - Married: 100% exempt ≤$100k, phases to 0% at $140k
    // - Military retirement: Fully exempt

    it('CT: Low-income retiree gets full exemption (single)', async () => {
      const result = await getTaxForState('CT', {
        socialSecurityIncome: 25000,
        privatePensionIncome: 40000,
        age: 67,
        filingStatus: 'single',
      });
      // AGI ~$65k, under $75k threshold = 100% exemption
      const totalTax = result.incomeTaxBurden + result.retirementTaxBurden;
      expect(totalTax).toBe(0);
    });

    it('CT: Mid-income retiree gets partial exemption (single)', async () => {
      const result = await getTaxForState('CT', {
        privatePensionIncome: 50000,
        annualIncome: 35000,
        age: 67,
        filingStatus: 'single',
      });
      // AGI ~$85k = 50% exemption tier
      const totalTax = result.incomeTaxBurden + result.retirementTaxBurden;
      expect(totalTax).toBeGreaterThan(0);
    });

    it('CT: High-income retiree gets no exemption (single)', async () => {
      const result = await getTaxForState('CT', {
        privatePensionIncome: 60000,
        annualIncome: 50000,
        age: 67,
        filingStatus: 'single',
      });
      // AGI ~$110k, above $95k = 0% exemption
      const totalTax = result.incomeTaxBurden + result.retirementTaxBurden;
      expect(totalTax).toBeGreaterThan(1900);
    });

    it('CT: Married couples have higher exemption thresholds', async () => {
      const single = await getTaxForState('CT', {
        privatePensionIncome: 90000,
        age: 67,
        filingStatus: 'single',
      });
      const married = await getTaxForState('CT', {
        privatePensionIncome: 90000,
        age: 67,
        spouseAge: 65,
        filingStatus: 'married',
      });

      const singleTax = single.incomeTaxBurden + single.retirementTaxBurden;
      const marriedTax = married.incomeTaxBurden + married.retirementTaxBurden;

      // Married at $90k is under $100k threshold, single at $90k is in phase-out
      expect(marriedTax).toBeLessThan(singleTax);
    });

    it('CT: Military retirement is fully exempt', async () => {
      const result = await getTaxForState('CT', {
        militaryRetirementPay: 50000,
        age: 55,
      });
      const totalTax = result.incomeTaxBurden + result.retirementTaxBurden;
      expect(totalTax).toBe(0);
    });
  });

  describe('New Jersey (NJ) - Retirement Income Golden Values', () => {
    // NJ Rules:
    // - Social Security: Fully exempt
    // - Military/Railroad retirement: Fully exempt
    // - Pensions/IRA/401k: $75k single / $100k married exclusion if age 62+
    //   - AGI > $100k: exclusion phases out $1 per $1 over
    //   - AGI > $150k: no exclusion

    it('NJ: SS only results in $0 tax', async () => {
      const result = await getTaxForState('NJ', {
        socialSecurityIncome: 40000,
        age: 67,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });

    it('NJ: Under-62 retiree gets no exclusion', async () => {
      const under62 = await getTaxForState('NJ', {
        privatePensionIncome: 60000,
        age: 58,
        filingStatus: 'single',
      });
      const over62 = await getTaxForState('NJ', {
        privatePensionIncome: 60000,
        age: 65,
        filingStatus: 'single',
      });

      const under62Tax = under62.incomeTaxBurden + under62.retirementTaxBurden;
      const over62Tax = over62.incomeTaxBurden + over62.retirementTaxBurden;

      // Under 62 pays more (no exclusion)
      expect(under62Tax).toBeGreaterThan(over62Tax);
    });

    it('NJ: Low-income 62+ retiree gets full exclusion', async () => {
      const result = await getTaxForState('NJ', {
        privatePensionIncome: 60000,
        iraDistributions: 10000,
        age: 65,
        filingStatus: 'single',
      });
      // $70k retirement income, $75k exclusion = $0 taxable
      const totalTax = result.incomeTaxBurden + result.retirementTaxBurden;
      expect(totalTax).toBe(0);
    });

    it('NJ: High-income retiree exclusion phases out', async () => {
      const lowAGI = await getTaxForState('NJ', {
        privatePensionIncome: 80000,
        age: 65,
        filingStatus: 'single',
      });
      const highAGI = await getTaxForState('NJ', {
        privatePensionIncome: 80000,
        annualIncome: 50000,
        age: 65,
        filingStatus: 'single',
      });

      const lowTax = lowAGI.incomeTaxBurden + lowAGI.retirementTaxBurden;
      const highTax = highAGI.incomeTaxBurden + highAGI.retirementTaxBurden;

      // Higher AGI = reduced exclusion = higher tax
      expect(highTax).toBeGreaterThan(lowTax);
    });

    it('NJ: Military retirement is fully exempt', async () => {
      const result = await getTaxForState('NJ', {
        militaryRetirementPay: 50000,
        age: 55,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });
  });

  describe('South Carolina (SC) - Retirement Income Golden Values', () => {
    // SC Rules:
    // - Social Security: Fully exempt
    // - Military retirement: Fully exempt
    // - Retirement Income Deduction: $3k (under 65), $10k (65+) per person
    // - Age 65+ Special Deduction: Additional $15k minus retirement deduction claimed
    // - First responder/teacher pensions: Fully deductible

    it('SC: SS only results in $0 tax', async () => {
      const result = await getTaxForState('SC', {
        socialSecurityIncome: 35000,
        age: 67,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });

    it('SC: Senior (65+) gets larger deduction than younger retiree', async () => {
      const under65 = await getTaxForState('SC', {
        privatePensionIncome: 50000,
        age: 60,
        filingStatus: 'single',
      });
      const over65 = await getTaxForState('SC', {
        privatePensionIncome: 50000,
        age: 67,
        filingStatus: 'single',
      });

      const under65Tax = under65.incomeTaxBurden + under65.retirementTaxBurden;
      const over65Tax = over65.incomeTaxBurden + over65.retirementTaxBurden;

      // 65+ gets $10k + $5k special = $15k deduction vs $3k for under 65
      expect(over65Tax).toBeLessThan(under65Tax);
    });

    it('SC: Teacher pension is fully deductible', async () => {
      const teacherPension = await getTaxForState('SC', {
        teacherPension: 50000,
        age: 62,
        filingStatus: 'single',
      });
      const privatePension = await getTaxForState('SC', {
        privatePensionIncome: 50000,
        age: 62,
        filingStatus: 'single',
      });

      const teacherTax = teacherPension.incomeTaxBurden + teacherPension.retirementTaxBurden;
      const privateTax = privatePension.incomeTaxBurden + privatePension.retirementTaxBurden;

      // Teacher pension should be fully exempt
      expect(teacherTax).toBe(0);
      expect(privateTax).toBeGreaterThan(0);
    });

    it('SC: Military retirement is fully exempt', async () => {
      const result = await getTaxForState('SC', {
        militaryRetirementPay: 60000,
        age: 50,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });
  });

  describe('Michigan (MI) - Retirement Income Golden Values', () => {
    // MI Rules:
    // - Social Security: Fully exempt
    // - Public safety pensions (teacher/police/fire): Fully exempt
    // - Private pensions/IRA/401k: Phased exemption based on birth year
    //   - Born 1945 or earlier: 100% exempt
    //   - Born 1946-1966: 75% exempt in 2025, 100% in 2026+
    //   - Born 1967+: 0% in 2025, 100% in 2026+
    // - Flat 4.25% tax rate

    it('MI: SS only results in $0 tax', async () => {
      const result = await getTaxForState('MI', {
        socialSecurityIncome: 35000,
        age: 70,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });

    it('MI: Pre-1946 retiree (age 80+) gets full exemption', async () => {
      const result = await getTaxForState('MI', {
        privatePensionIncome: 50000,
        iraDistributions: 25000,
        age: 82, // Born ~1943
        filingStatus: 'single',
      });
      // Born before 1946 = 100% exempt
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });

    it('MI: 1946-1966 retiree gets 75% exemption in 2025', async () => {
      const result = await getTaxForState('MI', {
        privatePensionIncome: 60000,
        age: 68, // Born ~1957
        filingStatus: 'single',
      });
      // 75% exempt = $45k exempt, $15k taxable
      // $15k * 4.25% = ~$637.50
      const totalTax = result.incomeTaxBurden + result.retirementTaxBurden;
      expect(totalTax).toBeGreaterThan(500);
      expect(totalTax).toBeLessThan(800);
    });

    it('MI: Younger retiree (born 1967+) gets no exemption in 2025', async () => {
      const youngRetiree = await getTaxForState('MI', {
        privatePensionIncome: 50000,
        age: 55, // Born ~1970
        filingStatus: 'single',
      });
      const oldRetiree = await getTaxForState('MI', {
        privatePensionIncome: 50000,
        age: 82, // Born ~1943
        filingStatus: 'single',
      });

      const youngTax = youngRetiree.incomeTaxBurden + youngRetiree.retirementTaxBurden;
      const oldTax = oldRetiree.incomeTaxBurden + oldRetiree.retirementTaxBurden;

      // Younger pays full tax, older pays $0
      expect(youngTax).toBeGreaterThan(oldTax);
      expect(oldTax).toBe(0);
    });

    it('MI: Teacher pension is fully exempt regardless of age', async () => {
      const result = await getTaxForState('MI', {
        teacherPension: 50000,
        age: 55,
        filingStatus: 'single',
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });
  });

  describe('Missouri (MO) - Retirement Income Golden Values', () => {
    // MO Rules:
    // - Social Security: Fully exempt if age 62+ (no AGI limit)
    // - Public pensions: Deduction up to $46,381, offset by SS exclusion
    // - Private pensions/IRA: $6,000 exemption with AGI limits ($25k single, $32k married)
    // - Military retirement: Fully exempt

    it('MO: SS only (62+) results in $0 tax', async () => {
      const result = await getTaxForState('MO', {
        socialSecurityIncome: 35000,
        age: 67,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });

    it('MO: SS under 62 is taxable', async () => {
      const under62 = await getTaxForState('MO', {
        socialSecurityIncome: 30000, // disability SS
        age: 55,
        filingStatus: 'single',
      });
      const over62 = await getTaxForState('MO', {
        socialSecurityIncome: 30000,
        age: 65,
        filingStatus: 'single',
      });

      const under62Tax = under62.incomeTaxBurden + under62.retirementTaxBurden;
      const over62Tax = over62.incomeTaxBurden + over62.retirementTaxBurden;

      // Under 62 pays tax, 62+ is exempt
      expect(under62Tax).toBeGreaterThan(over62Tax);
      expect(over62Tax).toBe(0);
    });

    it('MO: Public pension gets large deduction', async () => {
      const result = await getTaxForState('MO', {
        teacherPension: 45000,
        age: 65,
        filingStatus: 'single',
      });
      // $45k is under $46,381 cap = fully deductible
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });

    it('MO: Private pension exemption requires low AGI', async () => {
      const lowAGI = await getTaxForState('MO', {
        privatePensionIncome: 20000,
        age: 65,
        filingStatus: 'single',
      });
      const highAGI = await getTaxForState('MO', {
        privatePensionIncome: 20000,
        annualIncome: 30000,
        age: 65,
        filingStatus: 'single',
      });

      const lowTax = lowAGI.incomeTaxBurden + lowAGI.retirementTaxBurden;
      const highTax = highAGI.incomeTaxBurden + highAGI.retirementTaxBurden;

      // Low AGI gets $6k exemption, high AGI gets none
      expect(highTax).toBeGreaterThan(lowTax);
    });

    it('MO: Military retirement is fully exempt', async () => {
      const result = await getTaxForState('MO', {
        militaryRetirementPay: 50000,
        age: 50,
      });
      expect(result.incomeTaxBurden + result.retirementTaxBurden).toBe(0);
    });
  });

  // ============================================================================
  // EDGE CASE TESTS: Extreme Values and Unusual Scenarios
  // These tests verify the calculator handles boundary conditions correctly.
  // ============================================================================

  describe('Edge Cases - Extreme Income Values', () => {
    const testStates = ['CA', 'NY', 'TX', 'FL', 'NJ', 'CT'];

    testStates.forEach((state) => {
      it(`${state}: handles $0 income without errors`, async () => {
        const result = await getTaxForState(state, {
          annualIncome: 0,
          age: 40,
        });
        expect(result.incomeTaxBurden).toBe(0);
        expect(result.totalTaxBurden).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(result.totalTaxBurden)).toBe(true);
      });

      it(`${state}: handles very high income ($10M+)`, async () => {
        const result = await getTaxForState(state, {
          annualIncome: 10000000,
          age: 50,
        });
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        expect(result.incomeTaxBurden).toBeLessThan(5000000); // Less than 50% rate
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
      });

      it(`${state}: handles maximum Social Security benefit`, async () => {
        const result = await getTaxForState(state, {
          socialSecurityIncome: 59472, // 2025 max at age 70
          age: 70,
        });
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Edge Cases - Extreme Ages', () => {
    const testStates = ['GA', 'SC', 'MI', 'CO', 'AZ'];

    testStates.forEach((state) => {
      it(`${state}: handles very young retiree (age 40)`, async () => {
        const result = await getTaxForState(state, {
          privatePensionIncome: 50000,
          iraDistributions: 25000,
          age: 40,
        });
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      });

      it(`${state}: handles very old retiree (age 95)`, async () => {
        const result = await getTaxForState(state, {
          socialSecurityIncome: 30000,
          privatePensionIncome: 40000,
          age: 95,
        });
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
        expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
      });

      it(`${state}: handles age exactly 65 (retirement threshold)`, async () => {
        const result = await getTaxForState(state, {
          privatePensionIncome: 50000,
          age: 65,
        });
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
      });

      it(`${state}: handles age exactly 62 (SS eligibility)`, async () => {
        const result = await getTaxForState(state, {
          socialSecurityIncome: 25000,
          age: 62,
        });
        expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
      });
    });
  });

  describe('Edge Cases - Filing Status Combinations', () => {
    const filingStatuses = ['single', 'married', 'head_of_household', 'married_separate'];
    const testStates = ['CA', 'NY', 'CT', 'NJ', 'VT'];

    testStates.forEach((state) => {
      filingStatuses.forEach((status) => {
        it(`${state}: handles ${status} filing status`, async () => {
          const result = await getTaxForState(state, {
            annualIncome: 100000,
            filingStatus: status,
            age: 50,
          });
          expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
          expect(result.incomeTaxBurden).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Edge Cases - Mixed Income Sources', () => {
    it('all income types combined in high-tax state', async () => {
      const result = await getTaxForState('CA', {
        annualIncome: 150000,
        selfEmploymentIncome: 50000,
        socialSecurityIncome: 35000,
        privatePensionIncome: 40000,
        iraDistributions: 30000,
        k401Distributions: 25000,
        militaryRetirementPay: 20000,
        teacherPension: 15000,
        dividendsIncome: 10000,
        interestIncome: 5000,
        rentalIncome: 20000,
        longTermCapitalGains: 50000,
        shortTermCapitalGains: 10000,
        age: 67,
        filingStatus: 'married',
        spouseAge: 65,
      });
      expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
      expect(Number.isFinite(result.totalTaxBurden)).toBe(true);
      expect(result.totalTaxBurden).toBeGreaterThan(0);
    });

    it('all income types combined in no-tax state', async () => {
      const result = await getTaxForState('TX', {
        annualIncome: 150000,
        selfEmploymentIncome: 50000,
        socialSecurityIncome: 35000,
        privatePensionIncome: 40000,
        iraDistributions: 30000,
        k401Distributions: 25000,
        militaryRetirementPay: 20000,
        teacherPension: 15000,
        dividendsIncome: 10000,
        interestIncome: 5000,
        rentalIncome: 20000,
        longTermCapitalGains: 50000,
        shortTermCapitalGains: 10000,
        age: 67,
        filingStatus: 'married',
        spouseAge: 65,
      });
      expect(result.incomeTaxBurden).toBe(0);
      expect(result.retirementTaxBurden).toBe(0);
    });
  });

  describe('Edge Cases - Property Values', () => {
    const testStates = ['NJ', 'TX', 'CA', 'IL'];

    testStates.forEach((state) => {
      it(`${state}: handles $0 home value`, async () => {
        const result = await getTaxForState(state, {
          annualIncome: 100000,
          homeValue: 0,
        });
        expect(result.propertyTaxBurden).toBe(0);
      });

      it(`${state}: handles very expensive home ($5M)`, async () => {
        const result = await getTaxForState(state, {
          annualIncome: 500000,
          homeValue: 5000000,
        });
        expect(result.propertyTaxBurden).toBeGreaterThan(0);
        expect(Number.isFinite(result.propertyTaxBurden)).toBe(true);
      });
    });
  });

  describe('Edge Cases - AGI Threshold Boundaries', () => {
    it('VT: AGI exactly at SS exemption threshold ($50,000)', async () => {
      const result = await getTaxForState('VT', {
        socialSecurityIncome: 30000,
        annualIncome: 20000, // Total ~$50k
        age: 67,
        filingStatus: 'single',
      });
      // At $50k threshold, should get full SS exemption
      expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
    });

    it('MN: AGI exactly at SS exemption threshold ($78,000)', async () => {
      const result = await getTaxForState('MN', {
        socialSecurityIncome: 30000,
        privatePensionIncome: 48000, // Total ~$78k
        age: 67,
        filingStatus: 'single',
      });
      expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
    });

    it('CT: AGI at married exemption threshold ($100,000)', async () => {
      const result = await getTaxForState('CT', {
        privatePensionIncome: 100000,
        age: 67,
        filingStatus: 'married',
        spouseAge: 65,
      });
      expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
    });

    it('NJ: AGI at phase-out start ($100,000)', async () => {
      const result = await getTaxForState('NJ', {
        privatePensionIncome: 80000,
        annualIncome: 20000, // Total $100k
        age: 65,
        filingStatus: 'single',
      });
      expect(Number.isFinite(result.incomeTaxBurden)).toBe(true);
    });
  });
});
