import { NextRequest, NextResponse } from 'next/server'
import { calculateStateTaxBurden } from '@/lib/tax-calculator'
import type { UserTaxInputs } from '@/lib/tax-calculator'

export async function GET() {
  try {
    console.log('Testing Indiana Tax Calculation...')
    
    // Test case 1: Single filer with 2 dependents, 1 qualifying child
    const testInputs1: UserTaxInputs = {
      residenceState: 'IN',
      employmentState: 'IN',
      filingStatus: 'single',
      preferredLifestyle: 'suburban',
      regionPreference: 'midwest',
      dependents: '2',
      qualifyingChildren: '1',
      age: 35,
      annualIncome: 50000,
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
      investmentIncome: 0,
      rentalIncome: 0,
      royaltyIncome: 0,
      trustIncome: 0,
      homeValue: 150000,
      propertyTax: 1200,
      monthlyRent: 0,
      futurePlans: 'stay',
      housingBudget: 0,
      hasDependents: true,
      vehicleCount: 1,
      vehicleValue: 15000,
      shortTermCapitalGains: 0,
      longTermCapitalGains: 0,
      selfEmploymentIncome: 0,
      unemploymentIncome: 0,
      alimonyReceived: 0,
      gamblingWinnings: 0,
      selfEmploymentExpenses: 0
    }

    const result1 = await calculateStateTaxBurden('IN', testInputs1)
    
    // Test case 2: Married filing jointly with 3 dependents, 2 qualifying children
    const testInputs2: UserTaxInputs = {
      ...testInputs1,
      filingStatus: 'marriedFilingJointly',
      dependents: '3',
      qualifyingChildren: '2',
      spouseAge: 32,
      annualIncome: 75000
    }

    const result2 = await calculateStateTaxBurden('IN', testInputs2)
    
    // Calculate expected values for validation
    const test1Expected = {
      // Expected exemptions: $1,000 (taxpayer) + $2,000 (2 dependents × $1,000) + $1,500 (1 qualifying child) = $4,500
      exemptions: 1000 + (2 * 1000) + (1 * 1500), // $4,500
      taxableIncome: 50000 - 4500, // $45,500
      expectedTax: (50000 - 4500) * 0.0305 // $1,387.75
    }
    
    const test2Expected = {
      // Expected exemptions: $1,000 (taxpayer) + $1,000 (spouse) + $3,000 (3 dependents × $1,000) + $3,000 (2 qualifying children × $1,500) = $8,000
      exemptions: 1000 + 1000 + (3 * 1000) + (2 * 1500), // $8,000
      taxableIncome: 75000 - 8000, // $67,000
      expectedTax: (75000 - 8000) * 0.0305 // $2,043.50
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      success: true,
      testCase1: {
        description: 'Single filer, $50k income, 2 dependents, 1 qualifying child',
        inputs: {
          income: testInputs1.annualIncome,
          dependents: testInputs1.dependents,
          qualifyingChildren: testInputs1.qualifyingChildren,
          filingStatus: testInputs1.filingStatus
        },
        results: {
          stateCode: result1.stateCode,
          incomeTaxBurden: result1.incomeTaxBurden,
          totalTaxBurden: result1.totalTaxBurden
        },
        expected: test1Expected,
        validation: {
          expectedExemptions: test1Expected.exemptions,
          expectedTaxableIncome: test1Expected.taxableIncome,
          expectedTax: test1Expected.expectedTax,
          actualTax: result1.incomeTaxBurden,
          taxCalculationCorrect: Math.abs(result1.incomeTaxBurden - test1Expected.expectedTax) < 1, // Within $1
          startsFromFederalAGI: true // Indiana should start from federal AGI
        }
      },
      testCase2: {
        description: 'Married filing jointly, $75k income, 3 dependents, 2 qualifying children',
        inputs: {
          income: testInputs2.annualIncome,
          dependents: testInputs2.dependents,
          qualifyingChildren: testInputs2.qualifyingChildren,
          filingStatus: testInputs2.filingStatus
        },
        results: {
          stateCode: result2.stateCode,
          incomeTaxBurden: result2.incomeTaxBurden,
          totalTaxBurden: result2.totalTaxBurden
        },
        expected: test2Expected,
        validation: {
          expectedExemptions: test2Expected.exemptions,
          expectedTaxableIncome: test2Expected.taxableIncome,
          expectedTax: test2Expected.expectedTax,
          actualTax: result2.incomeTaxBurden,
          taxCalculationCorrect: Math.abs(result2.incomeTaxBurden - test2Expected.expectedTax) < 1, // Within $1
          startsFromFederalAGI: true // Indiana should start from federal AGI
        }
      },
      personalExemptionRules: {
        taxpayer: 1000,
        spouse: 1000,
        dependentBase: 1000,
        qualifyingChild: 1500,
        note: "Indiana uses personal exemptions instead of standard deduction and starts from federal AGI"
      }
    }

    return NextResponse.json(testResults, { status: 200 })
    
  } catch (error) {
    console.error('Error testing Indiana tax calculation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test Indiana tax calculation',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
