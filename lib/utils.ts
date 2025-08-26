import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate student loan interest deduction with income phaseout
export function calculateStudentLoanInterestDeduction(
  studentLoanInterestPaid: number,
  magi: number,
  filingStatus: string
): number {
  if (studentLoanInterestPaid <= 0) return 0;
  
  // Married Filing Separately is not eligible
  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("separate")) {
    return 0;
  }
  
  // Determine phaseout thresholds based on filing status
  let phaseoutStart: number;
  let phaseoutEnd: number;
  
  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("joint")) {
    // Married Filing Jointly
    phaseoutStart = 155000;
    phaseoutEnd = 185000;
  } else {
    // Single or Head of Household
    phaseoutStart = 75000;
    phaseoutEnd = 90000;
  }
  
  // Calculate deduction based on income level
  const maxDeduction = 2500;
  let allowedDeduction = Math.min(studentLoanInterestPaid, maxDeduction);
  
  if (magi <= phaseoutStart) {
    // Full deduction allowed
    return allowedDeduction;
  } else if (magi >= phaseoutEnd) {
    // No deduction allowed
    return 0;
  } else {
    // Partial deduction - linear phaseout
    const phaseoutRange = phaseoutEnd - phaseoutStart;
    const excessIncome = magi - phaseoutStart;
    const reductionPercentage = excessIncome / phaseoutRange;
    const deductionPercentage = 1 - reductionPercentage;
    
    return Math.round(allowedDeduction * deductionPercentage);
  }
}

// Calculate American Opportunity Tax Credit (AOTC)
export function calculateAOTCCredit(
  qualifiedExpenses: number,
  magi: number,
  filingStatus: string
): number {
  if (qualifiedExpenses <= 0) return 0;

  // Married Filing Separately is not eligible
  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("separate")) {
    return 0;
  }

  // Determine phaseout thresholds based on filing status
  let phaseoutStart: number;
  let phaseoutEnd: number;

  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("joint")) {
    // Married Filing Jointly
    phaseoutStart = 160000;
    phaseoutEnd = 180000;
  } else {
    // Single or Head of Household
    phaseoutStart = 80000;
    phaseoutEnd = 90000;
  }

  // Calculate base credit
  let credit = 0;
  const first2000 = Math.min(qualifiedExpenses, 2000);
  const remaining = Math.max(0, qualifiedExpenses - 2000);
  const next2000 = Math.min(remaining, 2000);

  credit = (first2000 * 1.0) + (next2000 * 0.25); // 100% of first $2,000 + 25% of next $2,000
  credit = Math.min(credit, 2500); // Max $2,500

  // Apply income phaseout if MAGI is above threshold
  if (magi <= phaseoutStart) {
    return credit;
  } else if (magi >= phaseoutEnd) {
    return 0;
  } else {
    // Linear phaseout
    const phaseoutRange = phaseoutEnd - phaseoutStart;
    const excessIncome = magi - phaseoutStart;
    const reductionPercentage = excessIncome / phaseoutRange;
    return Math.round(credit * (1 - reductionPercentage));
  }
}

// Calculate Lifetime Learning Credit (LLC)
export function calculateLLCCredit(
  qualifiedExpenses: number,
  magi: number,
  filingStatus: string
): number {
  if (qualifiedExpenses <= 0) return 0;

  // Married Filing Separately is not eligible
  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("separate")) {
    return 0;
  }

  // Determine phaseout thresholds based on filing status
  let phaseoutStart: number;
  let phaseoutEnd: number;

  if (filingStatus.toLowerCase().includes("married") && filingStatus.toLowerCase().includes("joint")) {
    // Married Filing Jointly
    phaseoutStart = 160000;
    phaseoutEnd = 180000;
  } else {
    // Single or Head of Household
    phaseoutStart = 80000;
    phaseoutEnd = 90000;
  }

  // Calculate base credit (20% of up to $10,000 qualified expenses)
  const eligibleExpenses = Math.min(qualifiedExpenses, 10000);
  let credit = eligibleExpenses * 0.20; // 20%
  credit = Math.min(credit, 2000); // Max $2,000

  // Apply income phaseout if MAGI is above threshold
  if (magi <= phaseoutStart) {
    return credit;
  } else if (magi >= phaseoutEnd) {
    return 0;
  } else {
    // Linear phaseout
    const phaseoutRange = phaseoutEnd - phaseoutStart;
    const excessIncome = magi - phaseoutStart;
    const reductionPercentage = excessIncome / phaseoutRange;
    return Math.round(credit * (1 - reductionPercentage));
  }
}

// Calculate education credit (AOTC or LLC)
export function calculateEducationCredit(
  creditType: string,
  qualifiedExpenses: number,
  magi: number,
  filingStatus: string
): number {
  if (creditType === "aotc") {
    return calculateAOTCCredit(qualifiedExpenses, magi, filingStatus);
  } else if (creditType === "llc") {
    return calculateLLCCredit(qualifiedExpenses, magi, filingStatus);
  }
  return 0;
}

// Utility to calculate and store AGI from localStorage user inputs
// Calculate Connecticut personal exemption with phase-out
export function calculateConnecticutPersonalExemption(
  agi: number,
  filingStatus: string,
  stateData: any
): number {
  // Get exemption data for the filing status
  const exemptionData = stateData.incomeTax.personalExemption[filingStatus.toLowerCase()];
  if (!exemptionData) return 0;

  const {
    maxExemption,
    maxExemptionThreshold,
    noExemptionThreshold,
    phaseOutIncrement
  } = exemptionData;

  // If AGI is below or at threshold, get full exemption
  if (agi <= maxExemptionThreshold) {
    console.log(`CT: Full personal exemption of $${maxExemption} applied (AGI: $${agi} <= threshold: $${maxExemptionThreshold})`);
    return maxExemption;
  }

  // If AGI is above the no exemption threshold, no exemption applies
  if (agi > noExemptionThreshold) {
    console.log(`CT: No personal exemption - AGI ($${agi}) exceeds maximum threshold ($${noExemptionThreshold})`);
    return 0;
  }

  // Calculate phase-out
  const excessAGI = agi - maxExemptionThreshold;
  const reductionSteps = Math.ceil(excessAGI / 1000); // Round up to nearest $1,000
  const reduction = reductionSteps * phaseOutIncrement;
  const exemption = Math.max(0, maxExemption - reduction);

  console.log(`CT: Reduced personal exemption calculated:`, {
    agi,
    excessAGI,
    reductionSteps,
    reduction,
    finalExemption: exemption
  });

  return exemption;
}

export function calculateAndStoreAGI() {
  // Read from localStorage
  const basicInfo = JSON.parse(localStorage.getItem("taxCalculator_basicInfo") || "{}")
  const incomeInfo = JSON.parse(localStorage.getItem("taxCalculator_incomeInfo") || "{}")
  const creditsDeductions = JSON.parse(localStorage.getItem("taxCalculator_creditsDeductions") || "{}")

  // Calculate net self-employment income
  const selfEmploymentIncome = Number(incomeInfo.selfEmploymentIncome) || 0;
  const selfEmploymentExpenses = Number(creditsDeductions.selfEmploymentExpenses) || 0;
  const netSelfEmploymentIncome = Math.max(0, selfEmploymentIncome - selfEmploymentExpenses);

  // Calculate self-employment tax and deduction
  const isSelfEmployed = creditsDeductions.isSelfEmployed || false;
  const selfEmploymentTax = isSelfEmployed ? netSelfEmploymentIncome * 0.153 : 0; // 15.3% SE tax rate
  const selfEmploymentTaxDeduction = selfEmploymentTax * 0.5; // 50% of SE tax is deductible

  // Calculate self-employed health insurance deduction (capped at net SE income)
  const healthInsurancePremiums = Number(creditsDeductions.selfEmployedHealthInsurance) || 0;
  const selfEmployedHealthInsuranceDeduction = isSelfEmployed 
    ? Math.min(healthInsurancePremiums, netSelfEmploymentIncome)
    : 0;

  // Combine relevant fields for AGI calculation
  // Adjust field names as needed to match your actual data structure
  const inputs = {
    wages: Number(incomeInfo.annualIncome) || 0,
    interest: Number(incomeInfo.interestIncome) || 0,
    dividends: Number(incomeInfo.dividendsIncome) || 0,
    capitalGains: (Number(incomeInfo.shortTermCapitalGains) || 0) + (Number(incomeInfo.longTermCapitalGains) || 0),
    retirementIncome: (Number(incomeInfo.iraDistributions) || 0) + (Number(incomeInfo.privatePensionIncome) || 0) + (Number(incomeInfo.militaryRetirementPay) || 0) + (Number(creditsDeductions.earlyWithdrawalAmount) || 0),
    businessIncome: Number(incomeInfo.selfEmploymentIncome) || 0,
    otherIncome: (Number(incomeInfo.rentalIncome) || 0) + (Number(incomeInfo.royaltyIncome) || 0) + (Number(incomeInfo.trustIncome) || 0) + (Number(incomeInfo.gamblingWinnings) || 0) + (Number(incomeInfo.unemploymentIncome) || 0),
    adjustments: {
      educator_expenses: Number(creditsDeductions.educatorExpenses) || 0,
      health_savings_account_contributions: Number(creditsDeductions.hsaContributions) || 0,
      moving_expenses_for_military: Number(creditsDeductions.militaryMovingExpenses) || 0,
      self_employment_tax_deduction: selfEmploymentTaxDeduction,
      self_employed_health_insurance: selfEmployedHealthInsuranceDeduction,
      penalty_on_early_withdrawal_of_savings: 0, // Not currently collected
      ira_deduction: Number(creditsDeductions.iraContributions) || 0,
      student_loan_interest_deduction: Number(creditsDeductions.studentLoanInterest) || 0,
      tuition_and_fees: 0, // Not currently collected
      alimony_paid: Number(incomeInfo.alimonyPaid) || 0,
      other_adjustments: 0 // Not currently collected
    }
  }

  // AGI calculation
  const totalIncome =
    (inputs.wages || 0) +
    (inputs.interest || 0) +
    (inputs.dividends || 0) +
    (inputs.capitalGains || 0) +
    (inputs.retirementIncome || 0) +
    (inputs.businessIncome || 0) +
    (inputs.otherIncome || 0)

  const adj = inputs.adjustments || {}
  
  // Calculate MAGI first (AGI without student loan interest deduction)
  const adjustmentsWithoutStudentLoan = {
    educator_expenses: Math.min(adj.educator_expenses || 0, 300),
    health_savings_account_contributions: Math.min(adj.health_savings_account_contributions || 0, 8300),
    ira_deduction: Math.min(adj.ira_deduction || 0, 7000),
    moving_expenses_for_military: adj.moving_expenses_for_military || 0,
    self_employment_tax_deduction: adj.self_employment_tax_deduction || 0,
    self_employed_health_insurance: adj.self_employed_health_insurance || 0,
    penalty_on_early_withdrawal_of_savings: adj.penalty_on_early_withdrawal_of_savings || 0,
    tuition_and_fees: adj.tuition_and_fees || 0,
    alimony_paid: adj.alimony_paid || 0,
    other_adjustments: adj.other_adjustments || 0
  }
  
  const adjustmentsWithoutStudentLoanTotal = Object.values(adjustmentsWithoutStudentLoan).reduce((sum, val) => sum + val, 0)
  const magi = totalIncome - adjustmentsWithoutStudentLoanTotal
  
  // Calculate student loan interest deduction with phaseout
  const studentLoanInterestDeduction = calculateStudentLoanInterestDeduction(
    adj.student_loan_interest_deduction || 0,
    magi,
    basicInfo.filingStatus || "single"
  )
  
  // Calculate education credit
  const hasEducationCredits = creditsDeductions.hasEducationCredits === "yes";
  const educationCreditType = creditsDeductions.educationCreditType || "";
  const educationExpenses = Number(creditsDeductions.educationExpenses) || 0;
  const filingStatus = basicInfo.filingStatus || "single";

  const educationCredit = hasEducationCredits && educationCreditType && educationExpenses > 0
    ? calculateEducationCredit(educationCreditType, educationExpenses, magi, filingStatus)
    : 0;

  // Store education credit for results display
  localStorage.setItem("educationCredit", educationCredit.toString());

  // Final AGI calculation with student loan interest deduction and education credit
  const agi = magi - studentLoanInterestDeduction - educationCredit;
  localStorage.setItem("federalAGI", agi.toString());
  return agi;
}
