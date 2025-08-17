import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to calculate and store AGI from localStorage user inputs
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
    retirementIncome: (Number(incomeInfo.iraDistributions) || 0) + (Number(incomeInfo.privatePensionIncome) || 0) + (Number(incomeInfo.militaryRetirementPay) || 0),
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
      student_loan_interest_deduction: 0, // Not currently collected
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
  const cappedAdjustments = {
    educator_expenses: Math.min(adj.educator_expenses || 0, 300),
    health_savings_account_contributions: Math.min(adj.health_savings_account_contributions || 0, 8300), // Adjust for individual/family as needed
    ira_deduction: Math.min(adj.ira_deduction || 0, 7000),
    student_loan_interest_deduction: Math.min(adj.student_loan_interest_deduction || 0, 2500),
    moving_expenses_for_military: adj.moving_expenses_for_military || 0,
    self_employment_tax_deduction: adj.self_employment_tax_deduction || 0,
    self_employed_health_insurance: adj.self_employed_health_insurance || 0,
    penalty_on_early_withdrawal_of_savings: adj.penalty_on_early_withdrawal_of_savings || 0,
    tuition_and_fees: adj.tuition_and_fees || 0,
    alimony_paid: adj.alimony_paid || 0,
    other_adjustments: adj.other_adjustments || 0
  }
  const totalAdjustments = Object.values(cappedAdjustments).reduce((sum, val) => sum + val, 0)
  const agi = totalIncome - totalAdjustments
  localStorage.setItem("federalAGI", agi.toString())
  return agi
}
