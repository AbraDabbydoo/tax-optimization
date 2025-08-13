# State Retirement Tax Logic Documentation

This document provides a detailed breakdown of each state's retirement tax treatment as implemented in the tax optimization system.

## Alabama (AL)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates  
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates with $12,000 exemption per person age 65+
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** IRA/401k exemption is $12,000 per person 65+ (doubled for married filing jointly)

## Arizona (AZ)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at flat 2.5% rate
- **Public Pensions:** Taxed at flat 2.5% rate
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at flat 2.5% rate
- **Teacher/Police/Firefighter Pensions:** Taxed at flat 2.5% rate with $2,500 exemption per person (or $5,000 if both spouses worked qualifying jobs)
- **Notes:** Arizona has a flat 2.5% tax rate on all income. Teacher/police/firefighter exemptions require qualifying job history.

## Arkansas (AR)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates with $6,000 exemption per person age 59.5+
- **Public Pensions:** Taxed at standard state rates with $6,000 exemption per person age 59.5+
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at standard state rates with $6,000 exemption per person age 59.5+
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates with $6,000 exemption per person age 59.5+
- **Notes:** For married filing jointly, both spouses must be 59.5+ to get full $12,000 exemption. Under 59.5, IRA distributions are fully taxable.

## California (CA)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at normal California rates. Senior Head of Household Credit available for 65+ HoH filers with dependents (phases out at ~$92,719 AGI).

## Colorado (CO)
- **Social Security:** Taxed at standard state rates with age-based deduction
- **Private Pensions:** Taxed at standard state rates with age-based deduction
- **Public Pensions:** Taxed at standard state rates with age-based deduction
- **Military Retirement:** Taxed at standard state rates with age-based deduction
- **IRA/401k Distributions:** Taxed at standard state rates with age-based deduction
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates with age-based deduction
- **Notes:** Age-based deduction: $20,000 for 55-64, $24,000 for 65+. Married couples get deduction for both spouses.

## Connecticut (CT)
- **Social Security:** Not taxed (exempt if AGI < $75,000 single/$100,000 married, otherwise included in sliding scale)
- **Private Pensions:** Taxed with sliding scale exemption based on AGI
- **Public Pensions:** Taxed with sliding scale exemption based on AGI
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed with sliding scale exemption based on AGI
- **Teacher/Police/Firefighter Pensions:** Taxed with sliding scale exemption based on AGI
- **Notes:** Sliding scale exemption: 100% exempt if AGI ≤ $75,000 single/$100,000 married, decreasing to 0% at higher AGI levels. Military retirement is always exempt.

## Delaware (DE)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates with age-based exclusion
- **Public Pensions:** Taxed at standard state rates with age-based exclusion
- **Military Retirement:** Excluded up to $25,000 per person age 60+
- **IRA/401k Distributions:** Taxed at standard state rates with age-based exclusion
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates with age-based exclusion
- **Notes:** Age-based exclusion: $2,000 per person under 60, $12,500 per person 60+. Military gets $25,000 exclusion if 60+.

## Florida (FL)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** Florida has no state income tax on any retirement income

## Georgia (GA)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed with age-based exclusion
- **Public Pensions:** Taxed with age-based exclusion
- **Military Retirement:** Special rules for under 62 (see notes)
- **IRA/401k Distributions:** Taxed with age-based exclusion
- **Teacher/Police/Firefighter Pensions:** Taxed with age-based exclusion
- **Notes:** Age-based exclusion: $35,000 for ages 62-64, $65,000 for 65+. Under 62: military gets $17,500 exclusion (plus $17,500 more if non-retirement income ≥ $17,500).

## Hawaii (HI)
- **Social Security:** Not taxed
- **Private Pensions:** Only employee-contributed portion is taxed
- **Public Pensions:** Not taxed (fully exempt)
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Not taxed (treated as public pensions)
- **Notes:** Private pensions: only the portion funded by employee contributions is taxable. Employer-funded portion is exempt.

## Idaho (ID)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at 5.695% flat rate
- **Public Pensions:** Taxed at 5.695% flat rate (out-of-state)
- **Military Retirement:** Excluded up to $45,864 single/$68,796 married if 65+ or 62+ and disabled
- **IRA/401k Distributions:** Taxed at 5.695% flat rate
- **Teacher/Police/Firefighter Pensions:** Not taxed (Idaho pensions only)
- **Notes:** Idaho teacher/police/firefighter pensions are exempt. Out-of-state public pensions are taxed.

## Illinois (IL)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** Illinois exempts all retirement income from state taxation

## Indiana (IN)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at 3.05% flat rate with senior deduction
- **Public Pensions:** Taxed at 3.05% flat rate with senior deduction
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at 3.05% flat rate with senior deduction
- **Teacher/Police/Firefighter Pensions:** Taxed at 3.05% flat rate with senior deduction
- **Notes:** Senior deduction: $1,000 for 65+, plus $500 more if AGI < $40,000

## Iowa (IA)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed (for 55+ or disabled/survivors)
- **Public Pensions:** Not taxed (for 55+ or disabled/survivors)
- **Military Retirement:** Not taxed (for 55+ or disabled/survivors)
- **IRA/401k Distributions:** Not taxed (for 55+ or disabled/survivors)
- **Teacher/Police/Firefighter Pensions:** Not taxed (for 55+ or disabled/survivors)
- **Notes:** All retirement income is exempt for residents 55+ or disabled/survivors

## Kansas (KS)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Not taxed (fully exempt)
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Not taxed (treated as public pensions)
- **Notes:** Public pensions (KS PERS, federal/state/local/military/civil service/railroad) are exempt. Private pensions and IRA/401k are taxed.

## Kentucky (KY)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at 4% flat rate with $31,110 exclusion per person
- **Public Pensions:** Taxed at 4% flat rate with $31,110 exclusion per person
- **Military Retirement:** Excluded up to $31,110 per person (fully exempt if retired before 1998)
- **IRA/401k Distributions:** Taxed at 4% flat rate with $31,110 exclusion per person
- **Teacher/Police/Firefighter Pensions:** Taxed at 4% flat rate with $31,110 exclusion per person (service before 1998 is fully exempt)
- **Notes:** $31,110 exclusion per person (doubled for married filing jointly). Pre-1998 military retirement and pre-1998 teacher/police/firefighter service are fully exempt.

## Louisiana (LA)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates with $12,000 exemption per person age 65+
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** IRA/401k exemption is $12,000 per person 65+ (doubled for married filing jointly). Social Security and state/city pensions are exempt.

## Maine (ME)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates with $45,864 deduction per person (reduced by Social Security benefits)
- **Public Pensions:** Taxed at standard state rates with $45,864 deduction per person (reduced by Social Security benefits)
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at standard state rates with $45,864 deduction per person (reduced by Social Security benefits)
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates with $45,864 deduction per person (reduced by Social Security benefits)
- **Notes:** $45,864 deduction per person, reduced by Social Security benefits per person. Military retirement is fully exempt.

## Maryland (MD)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates with $39,500 exemption for 65+ or disabled
- **Public Pensions:** Taxed at standard state rates with $39,500 exemption for 65+ or disabled
- **Military Retirement:** Excluded up to $20,000 if 55+ or $12,500 if under 55
- **IRA/401k Distributions:** Taxed at standard state rates (traditional IRAs, SEPs, Keoghs fully taxable; Roth IRAs exempt)
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates with $39,500 exemption for 65+ or disabled
- **Notes:** $39,500 exemption for pensions and 401k for 65+ or disabled. Military retirement has age-based exclusions. Traditional IRAs, Roth IRAs, SEPs, and Keoghs are fully taxable.

## Massachusetts (MA)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at 5% flat rate with personal exemptions
- **Public Pensions:** Not taxed (government pensions exempt)
- **Military Retirement:** Not taxed (government pensions exempt)
- **IRA/401k Distributions:** Taxed at 5% flat rate with personal exemptions
- **Teacher/Police/Firefighter Pensions:** Not taxed (government pensions exempt)
- **Notes:** 5% flat rate on private pensions, IRAs, and 401k. 4% millionaire surcharge on income above $1 million. Personal exemptions: $4,400 single, $6,800 HoH, $8,800 married, plus $700 per person 65+.

## Michigan (MI)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at 4.25% flat rate with phased exemptions based on birth year
- **Public Pensions:** Taxed at 4.25% flat rate with phased exemptions based on birth year
- **Military Retirement:** Taxed at 4.25% flat rate with phased exemptions based on birth year
- **IRA/401k Distributions:** Taxed at 4.25% flat rate with phased exemptions based on birth year
- **Teacher/Police/Firefighter Pensions:** Not taxed (public safety pensions fully exempt)
- **Notes:** Phased exemptions: 75% exempt in 2025 for birth years 1946-1966, 100% exempt in 2026+. Public safety pensions are fully exempt.

## Minnesota (MN)
- **Social Security:** Taxed with AGI-based exemptions and phase-outs
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed with AGI-based subtractions and phase-outs
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed with AGI-based subtractions and phase-outs
- **Notes:** Social Security and public pensions have AGI-based phase-outs starting at $78,000 single/$100,000 married. Military and railroad retirement are exempt.

## Mississippi (MS)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates (normal distributions exempt, early/excess distributions taxable)
- **Public Pensions:** Taxed at standard state rates (normal distributions exempt, early/excess distributions taxable)
- **Military Retirement:** Taxed at standard state rates (normal distributions exempt, early/excess distributions taxable)
- **IRA/401k Distributions:** Taxed at standard state rates (normal distributions exempt, early/excess distributions taxable)
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates (normal distributions exempt, early/excess distributions taxable)
- **Notes:** Normal retirement distributions are fully exempt. Only early or excess distributions are taxable.

## Missouri (MO)
- **Social Security:** Not taxed (exempt for 62+ or disabled, no AGI limit)
- **Private Pensions:** Taxed at standard state rates with $6,000 exemption (subject to AGI limits)
- **Public Pensions:** Taxed at standard state rates with deduction up to $46,381 (offset by Social Security exclusion)
- **Military Retirement:** Not taxed (fully exempt)
- **IRA/401k Distributions:** Taxed at standard state rates with $6,000 exemption (subject to AGI limits)
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates with deduction up to $46,381 (offset by Social Security exclusion)
- **Notes:** Public pension deduction up to $46,381, reduced by Social Security exclusion. Private retirement exemption: $6,000 with AGI limits ($25K single, $32K married, $16K married separate).

## Montana (MT)
- **Social Security:** Taxed with tiered exemption based on AGI
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** 50% exemption limited by Montana wages
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** Social Security: full exclusion if AGI ≤ $25K single/$32K married, 50% exclusion if AGI between thresholds, 15% exclusion if AGI > upper thresholds. Age 65+ gets $5,500 subtraction ($11,000 married). Military retirement: 50% exemption limited by Montana wages, but NOT available to residents who became residents before July 1, 2023 if they began receiving military benefits before becoming Montana residents.

## Nebraska (NE)
- **Social Security:** Taxed at 50% inclusion rate (2025 onward)
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Not taxed (100% excluded)
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** Social Security: 50% inclusion rate for 2025 onward. Military retirement is 100% excluded. All other retirement income taxed at Nebraska rates (2.46% to 6.64%).

## Nevada (NV)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** Nevada has no state income tax on any retirement income

## New Hampshire (NH)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Interest & Dividends:** Taxed at 2% on amounts above $2,400 (single) or $4,800 (joint), phasing out by 2027
- **Notes:** New Hampshire has no state income tax on retirement income, but taxes interest and dividends above thresholds. All other income types are exempt from state taxation.

## New Jersey (NJ)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard New Jersey rates

## New Mexico (NM)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard New Mexico rates

## New York (NY)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard New York rates

## North Carolina (NC)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard North Carolina rates

## North Dakota (ND)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard North Dakota rates

## Ohio (OH)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Ohio rates

## Oklahoma (OK)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Oklahoma rates

## Oregon (OR)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Oregon rates

## Pennsylvania (PA)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Pennsylvania rates

## Rhode Island (RI)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Rhode Island rates

## South Carolina (SC)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard South Carolina rates

## South Dakota (SD)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** South Dakota has no state income tax on any retirement income

## Tennessee (TN)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** Tennessee has no state income tax on any retirement income

## Texas (TX)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** Texas has no state income tax on any retirement income

## Utah (UT)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Utah rates

## Vermont (VT)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Vermont rates

## Virginia (VA)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard Virginia rates

## Washington (WA)
- **Social Security:** Not taxed
- **Private Pensions:** Not taxed
- **Public Pensions:** Not taxed
- **Military Retirement:** Not taxed
- **IRA/401k Distributions:** Not taxed
- **Teacher/Police/Firefighter Pensions:** Not taxed
- **Notes:** Washington has no state income tax on any retirement income

## West Virginia (WV)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
- **Notes:** All retirement income is taxed at standard West Virginia rates

## Wisconsin (WI)
- **Social Security:** Not taxed
- **Private Pensions:** Taxed at standard state rates
- **Public Pensions:** Taxed at standard state rates
- **Military Retirement:** Taxed at standard state rates
- **IRA/401k Distributions:** Taxed at standard state rates
- **Teacher/Police/Firefighter Pensions:** Taxed at standard state rates
-

---

## Summary of States with Special Retirement Tax Treatment

### States with No Retirement Income Tax:
- **Florida (FL)**
- **Illinois (IL)**
- **Nevada (NV)**
- **New Hampshire (NH)**
- **South Dakota (SD)**
- **Tennessee (TN)**
- **Texas (TX)**
- **Washington (WA)**
- **Wyoming (WY)**

### States with Age-Based Exemptions:
- **Arkansas (AR):** $6,000 per person 59.5+ (both spouses must be 59.5+ for married)
- **Colorado (CO):** $20,000 for 55-64, $24,000 for 65+
- **Delaware (DE):** $2,000 under 60, $12,500 60+
- **Georgia (GA):** $35,000 for 62-64, $65,000 for 65+
- **Indiana (IN):** $1,000 for 65+ (plus $500 if AGI < $40,000)
- **Iowa (IA):** All retirement income exempt for 55+ or disabled/survivors
- **Louisiana (LA):** $12,000 IRA/401k exemption per person 65+
- **Maryland (MD):** $39,500 exemption for pensions and 401k for 65+ or disabled

### States with Flat Tax Rates:
- **Arizona (AZ):** 2.5% flat rate with teacher/police/firefighter exemptions
- **Idaho (ID):** 5.695% flat rate with military exemptions
- **Indiana (IN):** 3.05% flat rate with senior deductions
- **Kentucky (KY):** 4% flat rate with $31,110 exclusion per person
- **Massachusetts (MA):** 5% flat rate with personal exemptions and millionaire surcharge
- **Michigan (MI):** 4.25% flat rate with phased exemptions based on birth year

### States with AGI-Based Phase-Outs:
- **Connecticut (CT):** Sliding scale exemption based on AGI
- **Minnesota (MN):** Social Security and public pension phase-outs based on AGI
- **Missouri (MO):** Private retirement exemption with AGI limits ($25K single, $32K married, $16K married separate)
- **Montana (MT):** Social Security tiered exemption based on AGI ($25K/$32K full exclusion, $34K/$44K 50% exclusion, above 15% exclusion)

### States with Special Pension Treatment:
- **Hawaii (HI):** Only employee-contributed portion of private pensions taxed
- **Kansas (KS):** Public pensions exempt, private pensions taxed
- **Maine (ME):** $45,864 deduction per person, reduced by Social Security benefits
- **Mississippi (MS):** Normal distributions exempt, early/excess distributions taxable

### States with Military Retirement Special Rules:
- **Arizona (AZ):** Fully exempt
- **Arkansas (AR):** Fully exempt
- **Connecticut (CT):** Fully exempt
- **Delaware (DE):** $25,000 exclusion if 60+
- **Georgia (GA):** Special rules for under 62
- **Idaho (ID):** $45,864/$68,796 exclusion if 65+ or 62+ and disabled
- **Indiana (IN):** Fully exempt
- **Kentucky (KY):** $31,110 exclusion (fully exempt if retired before 1998)
- **Maine (ME):** Fully exempt
- **Maryland (MD):** Age-based exclusions ($20,000 if 55+, $12,500 if under 55)
- **Michigan (MI):** Subject to phased exemptions
- **Minnesota (MN):** Fully exempt
- **Missouri (MO):** Fully exempt
- **Montana (MT):** 50% exemption limited by Montana wages (with residency restrictions)
- **Nebraska (NE):** Fully exempt

### States with Teacher/Police/Firefighter Special Rules:
- **Arizona (AZ):** $2,500 exemption per person ($5,000 if both spouses worked qualifying jobs)
- **Idaho (ID):** Idaho pensions exempt, out-of-state taxed
- **Michigan (MI):** Public safety pensions fully exempt
- **Kentucky (KY):** Pre-1998 service fully exempt

---

*This document reflects the detailed retirement tax implementations as of 2024. Each state's specific rules, exemptions, and calculations are implemented in the tax optimization system.* 
