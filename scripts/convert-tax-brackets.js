// This script converts the income tax brackets CSV to JSON format
import fs from "fs"
import { parse } from "csv-parse/sync"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to save the output JSON
const outputPath = path.join(__dirname, "../public/data/state-tax-brackets.json")

async function convertTaxBrackets() {
  try {
    console.log("Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/income%20tax%20csv-RWV0QAYMyHTzlNwkmXyeywSml16Ygt.csv",
    )
    const csvData = await response.text()

    console.log("Parsing CSV data...")
    // Parse the CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    })

    // Create an object to store the state data
    const stateData = {}

    console.log("Processing records...")
    // Process each record
    records.forEach((row) => {
      // Skip rows with empty stateCode or the "DO NOT IMPORT" header row
      if (!row.stateCode || row.stateCode === "stateCode") return

      const stateCode = row.stateCode
      const bracketType = row.bracketType
      const filingStatus = row.filingStatus

      // Skip rows with empty filing status
      if (!filingStatus) return

      // Initialize state if not exists
      if (!stateData[stateCode]) {
        stateData[stateCode] = {
          incomeTax: {
            type: bracketType,
            hasTax: bracketType !== "none",
            brackets: {},
          },
        }
      }

      // Initialize filing status array if not exists
      if (!stateData[stateCode].incomeTax.brackets[filingStatus]) {
        stateData[stateCode].incomeTax.brackets[filingStatus] = []
      }

      // Skip adding brackets for "none" type
      if (bracketType !== "none") {
        // Parse numeric values
        const minIncome = row.minIncome === "" ? 0 : Number.parseFloat(row.minIncome)
        const maxIncome = row.maxIncome === "null" || row.maxIncome === "" ? null : Number.parseFloat(row.maxIncome)
        const rate = Number.parseFloat(row.rate)

        // Add bracket to appropriate filing status array
        stateData[stateCode].incomeTax.brackets[filingStatus].push({
          min: minIncome,
          max: maxIncome,
          rate: rate,
        })
      }
    })

    console.log("Sorting brackets...")
    // Sort brackets by min income for each state and filing status
    Object.keys(stateData).forEach((stateCode) => {
      const state = stateData[stateCode]

      if (state.incomeTax && state.incomeTax.brackets) {
        Object.keys(state.incomeTax.brackets).forEach((filingStatus) => {
          if (Array.isArray(state.incomeTax.brackets[filingStatus])) {
            state.incomeTax.brackets[filingStatus].sort((a, b) => a.min - b.min)
          }
        })
      }
    })

    console.log("Writing JSON file...")
    // Write the JSON file
    fs.writeFileSync(outputPath, JSON.stringify(stateData, null, 2))
    console.log(`Data saved to ${outputPath}`)

    // Display stats
    const stateCount = Object.keys(stateData).length
    console.log(`Processed ${stateCount} states`)

    // Count different tax types
    const taxTypes = {
      none: 0,
      flat: 0,
      progressive: 0,
    }

    Object.values(stateData).forEach((state) => {
      if (state.incomeTax) {
        taxTypes[state.incomeTax.type]++
      }
    })

    console.log(`Tax types: ${taxTypes.none} none, ${taxTypes.flat} flat, ${taxTypes.progressive} progressive`)

    return stateData
  } catch (error) {
    console.error("Error converting tax brackets:", error)
    throw error
  }
}

// Run the conversion
convertTaxBrackets()
