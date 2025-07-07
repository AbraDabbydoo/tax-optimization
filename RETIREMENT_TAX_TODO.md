# Retirement Tax TODOs & Review Checklist

This file tracks all outstanding TODOs, logic gaps, and review items for state retirement tax logic, UI, and data.

---

## Outstanding Logic/UI TODOs

- [ ] **New Mexico (NM):** Implement SB114 logic for non-Social Security-covered public pensions (requires user input for public service type/coverage).
- [ ] **North Dakota (ND):** Implement peace officer/firefighter pension exclusion (requires user input for 20+ years of service or job disability).
- [ ] **North Carolina (NC):** Confirm Bailey exemption logic and UI for edge cases (e.g., multiple pensions, partial service).
- [ ] **General:** Add/clarify user input fields for any state-specific retirement exclusions not currently captured.
- [ ] **General:** Review and implement annuity income handling for all states (ensure user input, data, and logic are correct; add fields if needed).

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

## Notes
- This file should be updated as new TODOs are discovered or completed.
- When a TODO is resolved, check it off and add a note with the PR/commit/date. 