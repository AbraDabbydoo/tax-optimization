# Tax Optimization Website

## Project Roadmap

See the full roadmap here: [ROADMAP.md](./ROADMAP.md)

## Updating Tax Bracket Data

To update the tax bracket data from the CSV file:

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the update script**:
   \`\`\`bash
   npm run update-tax-data
   \`\`\`

3. **Verify the data**:
   - Check that `public/data/state-tax-brackets.json` has been created
   - The file should contain tax bracket information for all states

4. **Test the application**:
   \`\`\`bash
   npm run dev
   \`\`\`
   - Navigate to the calculator and verify tax calculations are working correctly

## Data Structure

The tax bracket data is structured as follows:

\`\`\`json
{
  "CA": {
    "incomeTax": {
      "type": "progressive",
      "hasTax": true,
      "brackets": {
        "single": [
          { "min": 0, "max": 10099, "rate": 1 },
          { "min": 10099, "max": 23942, "rate": 2 },
          ...
        ],
        "marriedJoint": [...],
        "marriedSeparate": [...],
        "headOfHousehold": [...]
      }
    }
  }
}
\`\`\`

## Deployment

After updating the tax data, deploy the application to make the changes live:

\`\`\`bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod


i believe my tax calculator for delaware accounts for 65+ year olds getting $2500 more in deduction but i cant find this in my files. Which file is it in
It's implemented in the main tax calculator and the debug copy:

calculateStateTaxBurden — see the Delaware branch that reads seniorBenefitAmount and adds it to the standard deduction.
tax-calculator.ts

calculateStateTaxBurden — debug version with the same DE logic.
tax-calculator-debug.ts

The configured $2,500 value lives in the state data JSON under Delaware's standardDeduction:
state-tax-data-updated.json

## Maine standard deduction phase-out (code location)

The Maine standard deduction phase-out logic is implemented in the tax calculator code:

- Main implementation: `lib/tax-calculator.ts` — see `ME_STANDARD_DEDUCTION`, the `maineStandardDeduction()` function, and the caller `getStandardDeductionForState()`.
- Debug copy: `lib/tax-calculator-debug.ts` — contains the same `maineStandardDeduction()` and `getStandardDeductionForState()` logic.
- Reference data (if used): `updated-tax-data/state-tax-data-updated.json` (may contain Maine deduction values/thresholds).

Check those files to inspect or update the phase-out logic.