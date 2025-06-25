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
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/income%20tax%20csv-KAEF4Fol2YrjooFMm220X3h9VGeZEe.csv",
      {
        // Add cache busting to ensure we get fresh data
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }
    
    const csvData = await response.text()
    console.log(`CSV data fetched: ${csvData.length} characters`)
    
    // Log the first 200 characters to check format
    console.log("CSV preview:", csvData.substring(0, 200) + "...")

    console.log("Parsing CSV data...")
    // Parse the CSV data
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    })

    console.log(`Found ${records.length} rows in CSV`)
    
    // Log the first record to check structure
    if (records.length > 0) {
      console.log("First record structure:", JSON.stringify(records[0], null, 2))
    }

    // Create an object to store the state data
    const stateData = {}

    console.log("Processing records...")
    // Process each record
    let processedRows = 0
    let skippedRows = 0
    let stateCounter = {}
    
    records.forEach((row, index) => {
      // Skip rows with empty stateCode or the "DO NOT IMPORT" header row
      if (!row.stateCode || row.stateCode === "stateCode") {
        skippedRows++
        console.log(`Skipping row ${index + 1}: Missing state code or header row`)
        return
      }

      const stateCode = row.stateCode
      const bracketType = row.bracketType
      const filingStatus = row.filingStatus

      // Count rows by state
      stateCounter[stateCode] = (stateCounter[stateCode] || 0) + 1

      // Skip rows with empty filing status
      if (!filingStatus) {
        skippedRows++
        console.log(`Skipping row ${index + 1}: Missing filing status for state ${stateCode}`)
        return
      }

      processedRows++

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

    console.log(`Processed ${processedRows} rows, skipped ${skippedRows} rows`)
    console.log(`Found data for ${Object.keys(stateData).length} states: ${Object.keys(stateData).join(', ')}`)
    
    // Log how many rows were processed for each state
    console.log("Rows per state:", JSON.stringify(stateCounter, null, 2))

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

    // Check if Missouri data exists
    if (stateData["MO"]) {
      console.log("\nMissouri Tax Brackets:")
      console.log(JSON.stringify(stateData["MO"], null, 2))
    } else {
      console.log("\nWARNING: No data found for Missouri (MO)")
    }

    console.log(`\nWriting data for ${Object.keys(stateData).length} states to JSON file...`)
    // Write the JSON file
    fs.writeFileSync(outputPath, JSON.stringify(stateData, null, 2))
    
    // Verify the file was written correctly
    const fileStats = fs.statSync(outputPath)
    console.log(`File saved to ${outputPath} (${fileStats.size} bytes)`)

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
        taxTypes[state.incomeTax.type] = (taxTypes[state.incomeTax.type] || 0) + 1
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
  .then(() => {
    console.log("Conversion completed successfully!")
  })
  .catch(error => {
    console.error("Conversion failed:", error)
    process.exit(1)
  })