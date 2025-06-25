# Arizona Retirement Income Tax Rules - Examples

## Overview
Arizona has specific retirement income tax rules that differ from other states:

- **Social Security**: NOT taxed
- **Private Pension Income**: Taxed at 2.5%
- **Public Pension Income**: Taxed at 2.5%
- **Traditional IRA Distributions**: Taxed at 2.5%
- **Military Retirement**: NOT taxed
- **Teacher/Police/Firefighter Pensions**: 
  - $2,500 exemption per person if they worked in qualifying jobs
  - $5,000 exemption if BOTH spouses worked in qualifying jobs (teacher/police/firefighter)

## Important Note on Exemptions
The exemption amount depends on whether one or both spouses worked in qualifying jobs:
- **Single person**: $2,500 exemption if they worked as teacher/police/firefighter
- **Married couple, one spouse qualifying**: $2,500 exemption
- **Married couple, both spouses qualifying**: $5,000 exemption

## Example Scenarios

### Example 1: Single Retiree
**Filing Status**: Single  
**Income Sources**:
- Social Security: $30,000
- Private Pension: $40,000
- Public Pension (non-teacher): $20,000
- IRA Distributions: $25,000
- Military Retirement: $15,000
- Teacher Pension: $35,000

**Arizona Tax Calculation**:
- Social Security: $0 (not taxed)
- Private Pension: $40,000 × 2.5% = $1,000
- Public Pension: $20,000 × 2.5% = $500
- IRA Distributions: $25,000 × 2.5% = $625
- Military Retirement: $0 (not taxed)
- Teacher Pension: ($35,000 - $2,500 exemption) × 2.5% = $32,500 × 2.5% = $812.50

**Total Arizona Retirement Tax**: $2,937.50

### Example 2: Married Couple (Both Worked as Teachers)
**Filing Status**: Married Filing Jointly  
**Qualifying Jobs**: Both spouses worked as teachers  
**Income Sources**:
- Social Security: $50,000
- Private Pension: $60,000
- Public Pension (non-teacher): $25,000
- IRA Distributions: $40,000
- Military Retirement: $25,000
- Teacher Pension (Spouse 1): $45,000
- Teacher Pension (Spouse 2): $40,000

**Arizona Tax Calculation**:
- Social Security: $0 (not taxed)
- Private Pension: $60,000 × 2.5% = $1,500
- Public Pension: $25,000 × 2.5% = $625
- IRA Distributions: $40,000 × 2.5% = $1,000
- Military Retirement: $0 (not taxed)
- Teacher Pensions: ($45,000 + $40,000 - $5,000 exemption) × 2.5% = $80,000 × 2.5% = $2,000

**Total Arizona Retirement Tax**: $5,125

### Example 3: Married Couple (Only One Worked as Teacher)
**Filing Status**: Married Filing Jointly  
**Qualifying Jobs**: Only one spouse worked as teacher  
**Income Sources**:
- Social Security: $45,000
- Private Pension: $55,000
- Public Pension (non-teacher): $30,000
- IRA Distributions: $35,000
- Military Retirement: $20,000
- Teacher Pension (Spouse 1): $50,000
- Police Pension (Spouse 2): $0

**Arizona Tax Calculation**:
- Social Security: $0 (not taxed)
- Private Pension: $55,000 × 2.5% = $1,375
- Public Pension: $30,000 × 2.5% = $750
- IRA Distributions: $35,000 × 2.5% = $875
- Military Retirement: $0 (not taxed)
- Teacher Pension: ($50,000 - $2,500 exemption) × 2.5% = $47,500 × 2.5% = $1,187.50

**Total Arizona Retirement Tax**: $4,187.50

### Example 4: Married Couple (Neither Worked in Qualifying Jobs)
**Filing Status**: Married Filing Jointly  
**Qualifying Jobs**: Neither spouse worked as teacher/police/firefighter  
**Income Sources**:
- Social Security: $40,000
- Private Pension: $50,000
- Public Pension (non-teacher): $35,000
- IRA Distributions: $30,000
- Military Retirement: $20,000

**Arizona Tax Calculation**:
- Social Security: $0 (not taxed)
- Private Pension: $50,000 × 2.5% = $1,250
- Public Pension: $35,000 × 2.5% = $875
- IRA Distributions: $30,000 × 2.5% = $750
- Military Retirement: $0 (not taxed)
- Teacher/Police/Firefighter Pensions: $0 (no exemption since neither worked in qualifying jobs)

**Total Arizona Retirement Tax**: $2,875

## Key Points

1. **Flat Rate**: Arizona uses a flat 2.5% tax rate on all taxable retirement income
2. **Public Pensions**: Most public pensions are taxed at 2.5%, except for teacher/police/firefighter pensions which have exemptions
3. **Exemption Logic**: 
   - Single person with qualifying job: $2,500 exemption
   - Married couple, one spouse qualifying: $2,500 exemption
   - Married couple, both spouses qualifying: $5,000 exemption
   - Married couple, neither qualifying: $0 exemption
4. **Military Retirement**: Completely exempt from Arizona state tax
5. **Social Security**: Completely exempt from Arizona state tax

## Implementation Notes

The system now includes:
- `militaryRetirementPay` field in the UserTaxInputs interface
- `spouse1QualifyingJob` and `spouse2QualifyingJob` fields to track qualifying employment
- Arizona-specific retirement tax calculation function
- Updated state tax data with Arizona's retirement income rules
- Support for teacher/police/firefighter pension exemptions based on actual employment
- Public pensions taxed at 2.5% (except for exempted teacher/police/firefighter pensions) 