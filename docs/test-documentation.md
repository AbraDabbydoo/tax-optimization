# State Tax Calculator Test Documentation

## Overview

This document provides a comprehensive summary of the test suite for the state tax calculator. The test suite validates tax calculations across all 50 US states + DC, covering various income types, filing statuses, property scenarios, and expense categories.

**Total Tests: 4,776+ passing tests**

---

## Test Files Summary

| Test File | Tests | Description |
|-----------|-------|-------------|
| `state-tax-calculator-income.test.ts` | ~450 | Basic income levels and filing status |
| `state-tax-calculator-investment.test.ts` | 1,323 | Investment income scenarios |
| `state-tax-calculator-retirement.test.ts` | 1,706 | Retirement income scenarios |
| `state-tax-calculator-property.test.ts` | 515 | Property and vehicle tax scenarios |
| `state-tax-calculator-expenses.test.ts` | 1,130 | Monthly expenses and sales tax |
| `state-tax-calculator-validation.test.ts` | 30 | Input validation and edge cases |
| `state-tax-calculator-sanity.test.ts` | 72 | Comparative sanity checks |

---

## Detailed Test Coverage

### 1. state-tax-calculator-income.test.ts

**Purpose:** Validates basic income tax calculations across all states with various income levels and filing statuses.

**Test Scenarios:**
- Income levels: $25,000, $75,000, $200,000
- Filing statuses: Single, Married, Head of Household
- All 50 states + DC

**Key Validations:**
- State-specific standard deductions
- Personal exemptions and phase-outs
- Progressive tax bracket calculations
- Special state handling (WI sliding scale, RI/VT phase-outs, etc.)

---

### 2. state-tax-calculator-investment.test.ts — 1,323 tests

**Purpose:** Validates investment income taxation across all states.

#### Capital Gains Taxation
- Short-term capital gains only
- Long-term capital gains only
- Mixed capital gains scenarios
- High long-term gains ($250,000+)

#### Dividend Income Taxation
- Low dividend income ($5,000)
- Moderate dividend income ($25,000)
- High dividend income ($100,000)

#### Interest Income Taxation
- Low interest income ($2,000)
- Moderate interest income ($15,000)
- High interest income ($75,000)

#### Rental Income Taxation
- $1k/month rental income
- $3k/month rental income
- Multi-property rental income

#### Mixed Investment Portfolio Scenarios
- Conservative portfolio (interest/dividends heavy)
- Growth portfolio (capital gains heavy)
- Real estate investor profile
- High net worth diversified portfolio

#### Investment Income Combined with Wage Income
- Low wage + investment supplement
- High wage + passive income
- Moderate wage + rental income

#### Edge Cases
- Zero investment income
- Capital losses (negative gains)
- Very high investment income ($5M+)
- Investment income with dependents

---

### 3. state-tax-calculator-retirement.test.ts — 1,706 tests

**Purpose:** Validates retirement income taxation including state-specific exemptions and age-based benefits.

#### Social Security Income Taxation
- Average SS benefit ($18,000)
- Above-average SS benefit ($30,000)
- Maximum SS benefit 2025 ($45,936)

#### Traditional IRA/401k Distribution Taxation
- IRA distributions only
- 401k distributions only
- Mixed IRA/401k distributions
- High distributions ($100,000+)

#### Private Pension Income Taxation
- $2k/month pension
- $4k/month pension
- $8k/month pension

#### Military Retirement Pay Taxation
- E-7 20-year retirement ($24,000)
- O-5 25-year retirement ($48,000)
- O-8 30-year retirement ($84,000)

#### Government Pension Taxation
- Teacher pension
- Police pension
- Firefighter pension
- Other government pension

#### Annuity Income Taxation
- Small annuity ($12,000)
- Moderate annuity ($36,000)
- Large annuity ($72,000)

#### Mixed Retirement Income Portfolios
- Typical retiree (SS + small pension)
- Military retiree (military + SS)
- Teacher retiree (teacher pension + SS)
- Affluent retiree (multiple sources)
- High-income retiree (all sources)

#### Age-Based Exemptions
- Test ages: 55, 59, 62, 65, 67, 70, 75
- States with age-sensitive exemptions: AZ, CO, GA, KY, MI, NJ, NY, PA, SC, VA
- Age 64 vs 65 comparison tests

#### Retirement Income with Wage Income
- Part-time work + SS
- Full-time work + retirement income
- Consulting + full retirement

#### Edge Cases
- Early retirement (before 59.5)
- Very high retirement income
- Married couple with different ages
- Kentucky pre-1998 military retirement exemption
- Montana military retirement residency rules
- North Carolina Bailey exemption

---

### 4. state-tax-calculator-property.test.ts — 515 tests

**Purpose:** Validates property tax calculations, homestead exemptions, and vehicle taxes.

#### Home Value Based Property Tax
- Starter home ($200,000)
- Median home value ($400,000)
- Above-average home ($750,000)
- Luxury home ($1,500,000)
- High-value property ($5,000,000)

#### User-Provided Property Tax
- Low property tax ($3,000)
- Average property tax ($8,000)
- High property tax ($15,000)
- Very high property tax ($30,000)

#### Renter vs Homeowner Comparison
- Property tax impact on renters vs owners
- Validates renters have $0 property tax

#### Property Tax by Filing Status
- Single, Married, Head of Household
- Test states: CA, NY, TX, FL, NJ, IL, PA, OH, GA, NC

#### Property Tax Impact on Total Burden
- No property scenario
- With property scenario
- High-value property scenario
- Validates property tax inclusion in total burden

#### Alabama Homestead Exemptions
- H-1: Standard homestead (state + county tax exempt)
- H-2: Over-65 homestead (fully exempt up to 160 acres)
- H-3: Permanently disabled (fully exempt)
- H-4: Blind person exemption
- Primary residence requirements

#### Vehicle Tax Calculations
- Single vehicle: Economy car, Average new car, Luxury vehicle, Exotic car
- Multiple vehicles: 2-car, 3-car, 4-car households
- No vehicle scenario
- Vehicle array input handling

#### Edge Cases
- Zero home value
- Very high home value ($10M+)
- Next home value for movers
- Property tax with retirement income

---

### 5. state-tax-calculator-expenses.test.ts — 1,130 tests

**Purpose:** Validates sales tax calculations on various expense categories and complete household scenarios.

#### Grocery Sales Tax
- Single person monthly ($400)
- Couple monthly ($800)
- Family of 4 monthly ($1,200)
- Large family monthly ($1,800)

#### Prepared Food/Restaurant Sales Tax
- Occasional dining ($200/month)
- Moderate dining ($500/month)
- Frequent dining ($1,000/month)
- Heavy dining/delivery ($2,000/month)

#### Utility Sales Tax
- Apartment utilities ($150/month)
- Small home utilities ($300/month)
- Large home utilities ($500/month)
- High usage/luxury home ($800/month)

#### Digital Goods and Streaming Services
- Basic digital + streaming
- Moderate digital spending
- High digital spending

#### Medicine and Health Products
- Minimal OTC purchases
- Moderate health products
- High medical expenses

#### Services Sales Tax
- Basic services
- Moderate services
- High services spending

#### Complete Monthly Expense Profiles
- **Frugal single:** $615/month total expenses
- **Average single:** $1,300/month total expenses
- **Couple no kids:** $1,905/month total expenses
- **Family of 4:** $2,600/month total expenses
- **Affluent household:** $4,750/month total expenses

#### Total Tax Burden Scenarios
Complete household scenarios including:
- Young professional renter
- Dual income no kids homeowners (DINK)
- Family with children
- Single parent head of household
- Retired couple homeowner
- High net worth investor

#### State Comparisons
- No-income-tax states comparison (TX, FL, WA, TN, NV, WY, SD, AK)
- High-income-tax states comparison (CA, NY, NJ, OR, MN, CT)

#### Edge Cases
- Zero explicit expenses
- Very high expenses ($23k+/month)
- Expenses only (no income)

---

### 6. state-tax-calculator-validation.test.ts — 30 tests

**Purpose:** Validates input handling, edge cases, and result structure integrity.

#### Invalid State Codes
- Invalid state code (XX)
- Empty state code
- Lowercase state code
- State name instead of abbreviation

#### Negative Values
- Negative annual income
- Negative home value
- Negative vehicle value
- Negative self-employment income (business loss)
- Negative capital gains (losses)

#### Zero Values
- All zero income
- Zero age

#### Extremely High Values
- $100 million income
- $50 million home value
- Very high investment income

#### Invalid Filing Status
- Unknown filing status
- Empty filing status
- Various filing status formats (Single, SINGLE, MFJ, HOH, etc.)

#### Invalid Dependent Values
- Negative dependents
- Non-numeric dependents
- Very high number of dependents

#### Invalid Age Values
- Negative age
- Very old age (120)

#### Type Coercion
- String income values
- String home value
- Boolean dependents

#### Missing or Undefined Fields
- Missing optional income fields
- Undefined values
- Null values

#### Result Structure Validation
- Returns all expected properties
- Returns numeric values for all tax burdens

---

### 7. state-tax-calculator-sanity.test.ts — 72 tests

**Purpose:** Validates logical consistency and known tax relationships between states.

#### No-Income-Tax States vs High-Income-Tax States
- Validates FL, TX, WA, NV, WY, SD, AK have $0 income tax
- Validates CA, NY, NJ, OR, MN have positive income tax
- Tests at $75k, $150k, $300k, $1M income levels

#### Progressive Tax Logic
- Higher income = higher tax (for all income-tax states)
- Tests income progression: $25k → $50k → $75k → $100k → $150k → $200k → $300k

#### Property Tax Rankings
- High property tax states (NJ, IL, CT, NH) > Low property tax states (HI, AL, LA, WV)
- Property tax scales with home value

#### Filing Status Impact
- Married filing jointly ≤ Single for same income
- Tests across multiple states

#### Retirement-Friendly States
- No-income-tax states have $0 tax on retirement income

#### Social Security Exemption States
- States like FL, TX, PA, IL have $0 tax on SS-only income

#### Military Retirement Exemption States
- States like AL, AK, FL, HI, IL have $0 tax on military retirement only

#### No Sales Tax States
- DE, MT, NH, OR have minimal/zero sales tax

#### Total Tax Burden Comparisons
- TX burden is primarily property + sales tax
- OR burden is primarily income tax (no sales tax)
- High earner in CA > same in TX

#### Flat Tax vs Progressive Tax States
- Flat tax states (CO, IL, IN, etc.) have consistent effective rates
- Progressive states (CA, NY, OR) have higher effective rate at higher incomes

#### Dependent Impact
- Having dependents reduces or maintains tax burden

#### Age-Based Exemptions
- Seniors (65+) have same or lower tax on retirement income

#### California Specific Checks
- CA has high effective rate for high earners
- CA effective rate increases with income

#### Result Consistency
- Same inputs produce same results
- All tax components are non-negative

---

## Running the Tests

### Run All Tests
```bash
npx jest --config=jest.config.cjs
```

### Run Individual Test Files
```bash
# Basic income tests
npx jest test/state-tax-calculator-income.test.ts --config=jest.config.cjs

# Investment income tests
npx jest test/state-tax-calculator-investment.test.ts --config=jest.config.cjs

# Retirement income tests
npx jest test/state-tax-calculator-retirement.test.ts --config=jest.config.cjs

# Property tax tests
npx jest test/state-tax-calculator-property.test.ts --config=jest.config.cjs

# Monthly expenses tests
npx jest test/state-tax-calculator-expenses.test.ts --config=jest.config.cjs

# Input validation tests
npx jest test/state-tax-calculator-validation.test.ts --config=jest.config.cjs

# Comparative sanity tests
npx jest test/state-tax-calculator-sanity.test.ts --config=jest.config.cjs
```

### Run with Verbose Output
```bash
npx jest test/state-tax-calculator-income.test.ts --config=jest.config.cjs --verbose
```

### Run Silently (Suppress Warnings)
```bash
npx jest test/state-tax-calculator-income.test.ts --config=jest.config.cjs --silent
```

---

## Test Data Source

All tests load state tax data from:
```
public/updated-tax-data/2025/{STATE_CODE}.json
```

The test suite dynamically loads all available state data files and runs tests against each state.

---

## Key Testing Patterns

### Base User Inputs Template
Each test file uses a `createBaseUserInputs()` helper function that provides default values for all required input fields, allowing tests to focus on specific scenarios by only overriding relevant fields.

### State-Specific Validations
- **No income tax states:** AK, FL, NV, SD, TX, WA, WY
- **No sales tax states:** AK, DE, MT, NH, OR
- **Interest/dividend only tax:** NH

### Test Structure
Tests follow this pattern:
1. Create user inputs with specific scenario values
2. Call `calculateStateTaxBurden(state, userInputs)`
3. Validate result properties exist and are non-negative
4. Apply state-specific assertions where applicable

---

## Contributing

When adding new tests:
1. Follow the existing test structure and naming conventions
2. Use the `createBaseUserInputs()` helper to ensure all required fields are present
3. Include edge cases for new functionality
4. Ensure tests pass for all 50 states + DC
5. Update this documentation with new test coverage
