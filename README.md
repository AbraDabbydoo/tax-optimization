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
