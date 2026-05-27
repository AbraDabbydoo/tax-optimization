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

describe('State Tax Calculator - Income Levels and Filing Status', () => {
  // Dynamically get all state abbreviations from the loaded stateTaxData
  const states = Object.keys(stateTaxData);
  const incomeLevels = [25000, 75000, 200000]; // Low, medium, high
  const filingStatuses = ['single', 'married', 'head_of_household'];

  states.forEach((state) => {
    incomeLevels.forEach((income) => {
      filingStatuses.forEach((status) => {
        it(`calculates tax for ${state}, ${status}, income $${income}`, async () => {
          const estimatedTax = getEstimatedTax(state, income, status);
          const userInputs = {
            residenceState: state,
            employmentState: state,
            filingStatus: status,
            preferredLifestyle: "indifferent",
            regionPreference: "indifferent",
            dependents: "0",
            qualifyingChildren: "0",
            age: 40,
            spouseAge: 40,
            annualIncome: income,
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
            futurePlans: "",
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
            alDivorceDate: "",
            // Add any other required fields with defaults as needed
          };
          const result = await calculateStateTaxBurden(state, userInputs);
          // All CA tests use a 50 allowable margin due to potential differences in calculation methods
          expect(Math.abs(result.incomeTaxBurden - estimatedTax)).toBeLessThanOrEqual(50); // Allowable margin
        });
      });
    });
  });
});

function getEstimatedTax(state: string, income: number, status: string): number {
  // Use real state tax brackets and standard deduction
  const stateData = (stateTaxData as Record<string, any>)[state];
  if (!stateData || !stateData.incomeTax) return 0;
  
  // Check if state has income tax
  if (stateData.incomeTax.hasIncomeTax === false) return 0;
  
  const brackets = stateData.incomeTax.brackets;
  if (!brackets) return 0;
  
  let filingKey = status;
  // Normalize filing status
  if (filingKey === 'head_of_household') {
    filingKey = 'headOfHousehold';
  }
  const bracketList = brackets[filingKey] || brackets[status] || [];
  const isMarried = filingKey === 'married';
  
  // Calculate standard deduction - handle complex structures like Maine
  let stdDeduction = 0;
  const stdDeductionData = stateData.incomeTax.standardDeduction;
  
  // Wisconsin: sliding scale standard deduction
  if (state === 'WI') {
    stdDeduction = getWisconsinStandardDeduction(income, filingKey);
    // Add Wisconsin personal exemptions (hardcoded in calculator, $700 per person, $250 additional for 65+)
    const numTaxpayers = isMarried ? 2 : 1;
    const wiPersonalExemption = 700 * numTaxpayers;
    stdDeduction += wiPersonalExemption;
  }
  // Rhode Island: phase-out deduction + exemptions
  else if (state === 'RI') {
    const baseStdDeduction = stdDeductionData?.[filingKey] || 0;
    const exemptionPerPerson = stateData.incomeTax.personalExemption || 5100;
    const numExemptions = isMarried ? 2 : 1;
    const baseExemptions = numExemptions * exemptionPerPerson;
    const reducedStdDeduction = applyRhodeIslandPhaseOut(income, filingKey, baseStdDeduction);
    const reducedExemptions = applyRhodeIslandPhaseOut(income, filingKey, baseExemptions);
    stdDeduction = reducedStdDeduction + reducedExemptions;
  }
  // Vermont: standard deduction + personal exemptions with phase-out
  else if (state === 'VT') {
    const vtStdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
    const vtPersonalExemption = stateData.incomeTax.personalExemption || 4450;
    const numExemptions = isMarried ? 2 : 1;
    const vtExemptions = applyVermontPersonalExemptionPhaseOut(income, filingKey, vtPersonalExemption * numExemptions);
    stdDeduction = vtStdDeduction + vtExemptions;
  }
  // Montana: uses federal AGI as starting point with NO state standard deduction
  else if (state === 'MT') {
    // Montana uses federal AGI, no state standard deduction (returns 0)
    stdDeduction = 0;
  }
  // North Carolina: flat tax on federal AGI minus NC standard deduction  
  else if (state === 'NC') {
    // NC uses federal AGI minus state standard deduction
    stdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
  }
  // Virginia: standard deduction only (personal exemption only for retirement income)
  else if (state === 'VA') {
    const vaStdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
    stdDeduction = vaStdDeduction;
  }
  // West Virginia: uses standard deduction only (personal exemption only for retirement income)
  else if (state === 'WV') {
    const wvStdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
    stdDeduction = wvStdDeduction;
  }
  // Utah: uses standard deduction (credits only apply to retirement income)
  else if (state === 'UT') {
    const utStdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
    stdDeduction = utStdDeduction;
  }
  // North Dakota: uses total income with no standard deduction
  else if (state === 'ND') {
    // ND has hasIncomeTax=true but no standard deduction is applied
    stdDeduction = 0;
  }
  // South Carolina: uses standard deduction from data
  else if (state === 'SC') {
    stdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
  }
  // New Mexico: uses standard deduction from data
  else if (state === 'NM') {
    stdDeduction = Number(stdDeductionData?.[filingKey]) || 0;
  }
  // Maine-style complex deduction with phase-out
  else if (typeof stdDeductionData === 'object' && stdDeductionData !== null) {
    const statusDeduction = stdDeductionData[filingKey];
    if (typeof statusDeduction === 'object' && statusDeduction !== null && 'base' in statusDeduction) {
      const base = statusDeduction.base || 0;
      const threshold = statusDeduction.threshold || 0;
      const reductionDivisor = statusDeduction.reductionDivisor || 40;
      if (income <= threshold) {
        stdDeduction = base;
      } else {
        const over = Math.floor((income - threshold) / reductionDivisor);
        stdDeduction = Math.max(0, base - over);
      }
    } else {
      stdDeduction = Number(statusDeduction) || 0;
    }
  } else {
    stdDeduction = Number(stdDeductionData) || 0;
  }
  
  // Calculate personal exemption (for states not handled above)
  let personalExemption = 0;
  // Don't double-count personal exemptions for states already handled above
  const statesWithSpecialExemptionHandling = ['WI', 'RI', 'VT', 'VA', 'WV', 'UT'];
  if (!statesWithSpecialExemptionHandling.includes(state) && stateData.incomeTax.personalExemption) {
    const exemptionValue = Number(stateData.incomeTax.personalExemption) || 0;
    if (exemptionValue > 0) {
      personalExemption = exemptionValue;
    }
  }
  
  // Subtract standard deduction and personal exemption for taxable income
  const taxableIncome = Math.max(0, income - stdDeduction - personalExemption);
  let tax = 0;
  for (const bracket of bracketList) {
    const min = bracket.min;
    const max = bracket.max === null ? Infinity : bracket.max;
    const rate = bracket.rate / 100;
    if (taxableIncome > min) {
      const amountInBracket = Math.min(taxableIncome, max) - min;
      if (amountInBracket > 0) {
        const bracketTax = amountInBracket * rate;
        tax += bracketTax;
      }
      if (taxableIncome <= max) break;
    }
  }
  return tax;
}

// Wisconsin sliding scale standard deduction
function getWisconsinStandardDeduction(agi: number, filingKey: string): number {
  let maxDeduction = 0, phaseOutStart = 0, phaseOutEnd = 0;
  if (filingKey === "single") {
    maxDeduction = 13560;
    phaseOutStart = 19550;
    phaseOutEnd = 132549;
  } else if (filingKey === "headOfHousehold") {
    maxDeduction = 17520;
    phaseOutStart = 19550;
    phaseOutEnd = 132549;
  } else if (filingKey === "marriedSeparate") {
    maxDeduction = 11930;
    phaseOutStart = 13390;
    phaseOutEnd = 73709;
  } else if (filingKey === "married") {
    maxDeduction = 25110;
    phaseOutStart = 28210;
    phaseOutEnd = 155169;
  }
  if (agi > phaseOutEnd) return 0;
  if (agi < phaseOutStart) return maxDeduction;
  const phaseOutRate = maxDeduction / (phaseOutEnd - phaseOutStart);
  return Math.max(0, Math.round(maxDeduction - ((agi - phaseOutStart) * phaseOutRate)));
}

// Rhode Island phase-out for standard deduction and exemptions
function applyRhodeIslandPhaseOut(agi: number, filingKey: string, amount: number): number {
  // RI phase-out: reduces deductions/exemptions for high-income taxpayers
  // Threshold: $246,450 single, $246,450 MFJ - reduced by 10% for each $12,500 over threshold
  const threshold = 246450;
  if (agi <= threshold) return amount;
  const excess = agi - threshold;
  const reductionPercent = Math.min(1, Math.floor(excess / 12500) * 0.10);
  return Math.round(amount * (1 - reductionPercent));
}

// Vermont personal exemption phase-out
function applyVermontPersonalExemptionPhaseOut(agi: number, filingKey: string, exemption: number): number {
  // Vermont phases out personal exemptions at higher incomes
  // Threshold: $246,450 single, $492,900 MFJ
  const threshold = filingKey === 'married' ? 492900 : 246450;
  if (agi <= threshold) return exemption;
  // Phase-out: 2% for each $2,500 (or portion) over threshold, max 100%
  const excess = agi - threshold;
  const reductionPercent = Math.min(1, Math.ceil(excess / 2500) * 0.02);
  return Math.round(exemption * (1 - reductionPercent));
}
