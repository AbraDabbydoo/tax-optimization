# Retirement Tax TODOs & Review Checklist

This file tracks all outstanding TODOs, logic gaps, and review items for state retirement tax logic, UI, and data.

---

## Outstanding Logic/UI TODOs

- [ ] **Alimony Deductions:** Implement alimony deduction logic for states that allow it (e.g., Alabama follows federal rules for pre-2019 agreements). Requires user input for alimony payments and divorce agreement dates.
- [ ] **New Mexico (NM):** Implement SB114 logic for non-Social Security-covered public pensions (requires user input for public service type/coverage).
- [ ] **North Dakota (ND):** Implement peace officer/firefighter pension exclusion (requires user input for 20+ years of service or job disability).
- [ ] **North Carolina (NC):** Confirm Bailey exemption logic and UI for edge cases (e.g., multiple pensions, partial service).
- [ ] **Utah (UT):** Double check UT military and social security credit rules and implementation.
- [ ] **Washington (WA):** Washington does impose a 7% excise tax on long-term capital gains (e.g. stocks, bonds) over $262,000 annually, with 9.9% for gains exceeding $1 million. This does not apply to retirement account gains (e.g., IRA/401(k) distributions, Roth conversions are exempt).
- [ ] **West Virginia (WV):** Revisit social security and homestead exemptions for accuracy and future law changes.
- [ ] **General:** Add/clarify user input fields for any state-specific retirement exclusions not currently captured.
- [ ] **General:** Review and implement annuity income handling for all states (ensure user input, data, and logic are correct; add fields if needed).
- [ ] Implement inheritance taxes: to implement for all states
 **Notes:** All retirement income is taxed at standard Wisconsin rates
    - **TODO:** Track pre-1964 WI public pensions for exemption (these are fully exempt, but currently not tracked in user inputs)
    - **TODO:** Handle the $250 personal exemption for 65+ in the tax output (not currently included in retirement income calculation)
    [ ] **Revisit Michigan (MI)** pension/retirement deduction rules — Michigan provides an alternative deduction method for pension/retirement benefits in addition to the standard deduction. Confirm eligibility, calculation method, thresholds, and update retirement tax logic and state data



---

## State-by-State Review Checklist

### Interest, Dividend, & Annuity Treatment
- [ ] Review and confirm interest, dividend, and annuity tax treatment for every state (ensure data and logic match current law).
- [ ] Add/clarify user input fields for states that tax interest/dividends/annuities separately (e.g., NH, TN, etc.).

### Property Tax Exemptions
- [ ] Review property tax exemption logic for all states (e.g., senior, veteran, disability, homestead, circuit breaker, etc.).
- [ ] Ensure data files and calculation logic reflect major property tax exemptions.
- [ ] Add/clarify user input fields for property tax exemption eligibility where needed.

### Other Deductions/Exemptions
- [ ] Review all other state-level deductions/exemptions (e.g., senior, disability, veteran, low-income, etc.).
- [ ] Ensure data and logic reflect these deductions/exemptions.
- [ ] Add/clarify user input fields for eligibility as needed.

---

## Oregon Retirement Tax TODOs

- [ ] Handle part-year residents for the Oregon Retirement Income Credit (credit should be based only on Oregon-taxable retirement income).
- [ ] Implement federal-service pension subtraction for pre-October 1991 service (special subtraction for qualifying federal pensions).

---

## Notes
- This file should be updated as new TODOs are discovered or completed.
- When a TODO is resolved, check it off and add a note with the PR/commit/date.

- 