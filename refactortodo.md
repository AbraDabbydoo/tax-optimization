# Refactor Plan: Per-State Per-Year Tax Data

## Goal
Refactor the tax data structure so that each state and year has its own JSON file, e.g.:

- public/updated-tax-data/2025/AZ.json
- public/updated-tax-data/2025/CA.json
- public/updated-tax-data/2026/AZ.json

This enables version control, immutability, and easier validation.

## Steps

1. **Migration Script**
   - Write a script to read the current state-tax-data-2-updated.json (and similar files).
   - For each state, write its data to a new file under public/updated-tax-data/{year}/{state}.json.
   - Ensure the script creates the year directory if it does not exist.
   - Optionally, support migrating multiple years if more files are present.

2. **Codebase Refactor**
   - Update all code that loads tax data to use the new per-state per-year file structure.
   - Provide utility functions to load a single state, all states for a year, or all years for a state as needed.
   - Add error handling for missing or malformed files.

3. **Validation Tests**
   - Implement tests to validate each state file for:
     - Presence of required fields (e.g., standard deduction, income brackets or flat rate, food tax flag).
     - Value ranges (e.g., no negative rates, reasonable deduction amounts).
     - No nulls for required fields.
   - Run tests automatically on all files in public/updated-tax-data/{year}/.

4. **Documentation**
   - Update README and developer docs to describe the new data structure and validation process.

5. **Immutability & Versioning**
   - Ensure that once a year's data is written, it is not overwritten except for corrections (with changelog).
   - Add a process for adding new years (copy previous year, update as needed).

---

## Notes
- This structure is scalable and supports future years and states easily.
- If performance becomes an issue, consider a build step to bundle files for production use.
