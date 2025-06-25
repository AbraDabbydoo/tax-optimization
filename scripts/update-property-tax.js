// scripts/update-property-tax.js
import fs from "fs"
import { parse } from "csv-parse/sync"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths for input and output files
const inputPath1 = path.join(__dirname, "../public/data/state-tax-data.json")
const inputPath2 = path.join(__dirname, "../public/data/state-tax-data-2.json")
const outputPath1 = path.join(__dirname, "../public/data/state-tax-data.json")
const outputPath2 = path.join(__dirname, "../public/data/state-tax-data-2.json")

async function fetchCsv(url) {
  console.log(`Fetching property tax CSV data from ${url}...`)
  const response = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
  }

  const csvData = await response.text()
  console.log(`CSV data fetched: ${csvData.length} characters`)

  // Parse the CSV data
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  })

  console.log(`Found ${records.length} rows in CSV`)
  return records
}

async function updatePropertyTax() {
  try {
    // Load existing state tax data
    console.log("Loading existing state tax data...")
    let firstHalfData = {}
    let secondHalfData = {}

    try {
      const firstHalfJson = fs.readFileSync(inputPath1, "utf8")
      firstHalfData = JSON.parse(firstHalfJson)
      console.log(`Loaded data for ${Object.keys(firstHalfData).length} states from first half`)
    } catch (error) {
      console.warn(`Could not load first half data: ${error.message}`)
      console.log("Creating new first half data object")
    }

    try {
      const secondHalfJson = fs.readFileSync(inputPath2, "utf8")
      secondHalfData = JSON.parse(secondHalfJson)
      console.log(`Loaded data for ${Object.keys(secondHalfData).length} states from second half`)
    } catch (error) {
      console.warn(`Could not load second half data: ${error.message}`)
      console.log("Creating new second half data object")
    }

    // Combine data for processing
    const stateData = { ...firstHalfData, ...secondHalfData }

    // Fetch property tax CSV
    const propertyTaxRecords = await fetchCsv(
      "https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/State%20property%20tax%20rates-71e69spTH8WbS5XVlyKTwKxtdPZWPi.csv",
    )

    // Track states updated
    let statesUpdated = 0

    // Process property tax data
    propertyTaxRecords.forEach((record) => {
      const stateCode = record["State Code"]

      if (!stateCode) {
        console.warn("Skipping record with missing state code")
        return
      }

      // Initialize the state if it doesn't exist
      if (!stateData[stateCode]) {
        console.log(`Creating new state entry for ${stateCode}`)
        stateData[stateCode] = {
          name: record["State Name"] || stateCode,
          abbreviation: stateCode,
          // Initialize other tax fields with default values
          incomeTax: {
            brackets: {
              single: [],
              married: [],
              headOfHousehold: [],
              marriedSeparate: [],
            },
            hasIncomeTax: false,
            personalExemption: 0,
            dependentExemption: 0,
            standardDeduction: {
              single: 0,
              married: 0,
              headOfHousehold: 0,
              marriedSeparate: 0,
            },
            taxCredits: {
              childTaxCredit: 0,
              childCareTaxCredit: 0,
              earnedIncomeTaxCredit: false,
            },
          },
          salesTax: {
            stateRate: 0,
            averageLocalRate: 0,
            combinedRate: 0,
            categories: {
              groceries: { taxable: false, rate: 0 },
              preparedFood: { taxable: false, rate: 0 },
              utilities: { taxable: false, rate: 0 },
              services: { taxable: false, rate: 0 },
              digitalGoods: { taxable: false, rate: 0 },
              medicine: { taxable: false, rate: 0 },
              streamingSubscriptions: { taxable: false, rate: 0 },
            },
          },
        }
      }

      // Get the tax rate and handle format issues
      const taxRate = Number.parseFloat(record["Average Effective Property Tax Rate"])

      // Validate the tax rate
      if (isNaN(taxRate)) {
        console.warn(`Invalid tax rate for ${stateCode}: ${record["Average Effective Property Tax Rate"]}`)
        return
      }

      // Normalize the tax rate (convert to percentage if it's in decimal form)
      // If the rate is already in percentage form (e.g., 0.86 for 0.86%), use it as is
      // If the rate is in decimal form (e.g., 0.0086 for 0.86%), multiply by 100
      const normalizedRate = taxRate > 0.1 ? taxRate : taxRate * 100

      // Update property tax data
      stateData[stateCode].propertyTax = {
        averageEffectiveRate: normalizedRate,
        // If you have these fields in your CSV, uncomment and use them
        // medianAnnualTax: parseFloat(record["Median Annual Property Tax"] || 0),
        // medianHomeValue: parseFloat(record["Median Home Value"] || 0),
        // exemptions: record["Property Tax Exemptions"] || "",
        hasPropertyTax: true,
        lastUpdated: new Date().toISOString(),
      }

      statesUpdated++
    })

    // Split the data into two files (first half and second half alphabetically)
    const stateKeys = Object.keys(stateData).sort()
    const midpoint = Math.ceil(stateKeys.length / 2)

    const firstHalfStates = stateKeys.slice(0, midpoint)
    const secondHalfStates = stateKeys.slice(midpoint)

    firstHalfData = {}
    secondHalfData = {}

    firstHalfStates.forEach((stateCode) => {
      firstHalfData[stateCode] = stateData[stateCode]
    })

    secondHalfStates.forEach((stateCode) => {
      secondHalfData[stateCode] = stateData[stateCode]
    })

    // Write the data to files
    fs.writeFileSync(outputPath1, JSON.stringify(firstHalfData, null, 2))
    fs.writeFileSync(outputPath2, JSON.stringify(secondHalfData, null, 2))

    console.log(`Data saved to ${outputPath1} and ${outputPath2}`)
    console.log(`Updated property tax data for ${statesUpdated} states`)

    return stateData
  } catch (error) {
    console.error("Error updating property tax data:", error)
    throw error
  }
}

// Run the update
updatePropertyTax()
  .then(() => {
    console.log("Property tax update completed successfully!")
  })
  .catch((error) => {
    console.error("Update failed:", error)
    process.exit(1)
  })
