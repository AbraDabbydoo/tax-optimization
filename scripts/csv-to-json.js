// scripts/update-tax-brackets.js
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
  console.log(`Fetching CSV data from ${url}...`)
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
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

async function updateTaxBrackets() {
  try {
    // Load existing state tax data
    console.log("Loading existing state tax data...")
    let firstHalfData = {}
    let secondHalfData = {}
    
    try {
      const firstHalfJson = fs.readFileSync(inputPath1, 'utf8')
      firstHalfData = JSON.parse(firstHalfJson)
      console.log(`Loaded data for ${Object.keys(firstHalfData).length} states from first half`)
    } catch (error) {
      console.warn(`Could not load first half data: ${error.message}`)
      console.log("Creating new first half data object")
    }
    
    try {
      const secondHalfJson = fs.readFileSync(inputPath2, 'utf8')
      secondHalfData = JSON.parse(secondHalfJson)
      console.log(`Loaded data for ${Object.keys(secondHalfData).length} states from second half`)
    } catch (error) {
      console.warn(`Could not load second half data: ${error.message}`)
      console.log("Creating new second half data object")
    }
    
    // Combine data for processing
    const stateData = { ...firstHalfData, ...secondHalfData }
    
    // Fetch income tax brackets CSV
    const incomeTaxBracketsRecords = await fetchCsv(
      "https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/income%20tax%20csv-AQkKEpfKLE11EHTy32B1SrXzyJ1Mcn.csv"
    )
    
    // Process income tax brackets
    const incomeTaxBrackets = {}
    
    incomeTaxBracketsRecords.forEach((record) => {
      const stateCode = record.stateCode
      
      if (!stateCode) {
        return
      }
      
      // Initialize the state's brackets if not already done
      if (!incomeTaxBrackets[stateCode]) {
        incomeTaxBrackets[stateCode] = {
          single: [],
          married: [],
          headOfHousehold: [],
          marriedSeparate: [] // Added marriedSeparate array
        }
      }
      
      // Determine filing status and add bracket
      const filingStatus = record.filingStatus?.toLowerCase()
      if (filingStatus === "single") {
        incomeTaxBrackets[stateCode].single.push({
          min: Number.parseFloat(record.minIncome) || 0,
          max: record.maxIncome && record.maxIncome.toLowerCase() !== "null" ? 
            Number.parseFloat(record.maxIncome) : 
            null,
          rate: Number.parseFloat(record.rate) || 0
        })
      } else if (filingStatus === "married" || filingStatus === "married filing jointly") {
        incomeTaxBrackets[stateCode].married.push({
          min: Number.parseFloat(record.minIncome) || 0,
          max: record.maxIncome && record.maxIncome.toLowerCase() !== "null" ? 
            Number.parseFloat(record.maxIncome) : 
            null,
          rate: Number.parseFloat(record.rate) || 0
        })
      } else if (filingStatus === "head of household") {
        incomeTaxBrackets[stateCode].headOfHousehold.push({
          min: Number.parseFloat(record.minIncome) || 0,
          max: record.maxIncome && record.maxIncome.toLowerCase() !== "null" ? 
            Number.parseFloat(record.maxIncome) : 
            null,
          rate: Number.parseFloat(record.rate) || 0
        })
      } else if (filingStatus === "married separate" || filingStatus === "married filing separately") {
        // Added handling for married filing separately
        incomeTaxBrackets[stateCode].marriedSeparate.push({
          min: Number.parseFloat(record.minIncome) || 0,
          max: record.maxIncome && record.maxIncome.toLowerCase() !== "null" ? 
            Number.parseFloat(record.maxIncome) : 
            null,
          rate: Number.parseFloat(record.rate) || 0
        })
      }
    })
    
    // Sort brackets by min income for each filing status
    for (const stateCode in incomeTaxBrackets) {
      ["single", "married", "headOfHousehold", "marriedSeparate"].forEach(status => { // Added marriedSeparate to sorting
        incomeTaxBrackets[stateCode][status].sort((a, b) => a.min - b.min)
      })
    }
    
    // Update state data with income tax brackets
    for (const stateCode in stateData) {
      // Initialize incomeTax object if it doesn't exist
      if (!stateData[stateCode].incomeTax) {
        stateData[stateCode].incomeTax = {
          brackets: {
            single: [],
            married: [],
            headOfHousehold: [],
            marriedSeparate: [] // Added marriedSeparate array
          },
          hasIncomeTax: false,
          personalExemption: 0,
          dependentExemption: 0,
          standardDeduction: {
            single: 0,
            married: 0,
            headOfHousehold: 0,
            marriedSeparate: 0 // Added marriedSeparate to standard deduction
          },
          taxCredits: {
            childTaxCredit: 0,
            childCareTaxCredit: 0,
            earnedIncomeTaxCredit: false
          }
        }
      }
      
      // Update brackets if we have them for this state
      if (incomeTaxBrackets[stateCode]) {
        stateData[stateCode].incomeTax.brackets = incomeTaxBrackets[stateCode]
        stateData[stateCode].incomeTax.hasIncomeTax = (
          incomeTaxBrackets[stateCode].single.length > 0 || 
          incomeTaxBrackets[stateCode].married.length > 0 || 
          incomeTaxBrackets[stateCode].headOfHousehold.length > 0 ||
          incomeTaxBrackets[stateCode].marriedSeparate.length > 0 // Added marriedSeparate check
        )
      }
    }
    
    // Add any new states from the brackets CSV that weren't in the original data
    for (const stateCode in incomeTaxBrackets) {
      if (!stateData[stateCode]) {
        console.log(`Adding new state: ${stateCode}`)
        stateData[stateCode] = {
          name: stateCode, // You might want to add a proper name later
          abbreviation: stateCode,
          incomeTax: {
            brackets: incomeTaxBrackets[stateCode],
            hasIncomeTax: (
              incomeTaxBrackets[stateCode].single.length > 0 || 
              incomeTaxBrackets[stateCode].married.length > 0 || 
              incomeTaxBrackets[stateCode].headOfHousehold.length > 0 ||
              incomeTaxBrackets[stateCode].marriedSeparate.length > 0 // Added marriedSeparate check
            ),
            personalExemption: 0,
            dependentExemption: 0,
            standardDeduction: {
              single: 0,
              married: 0,
              headOfHousehold: 0,
              marriedSeparate: 0 // Added marriedSeparate to standard deduction
            },
            taxCredits: {
              childTaxCredit: 0,
              childCareTaxCredit: 0,
              earnedIncomeTaxCredit: false
            }
          },
          // Initialize other tax fields with default values
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
              streamingSubscriptions: { taxable: false, rate: 0 }
            }
          },
          propertyTax: {
            averageEffectiveRate: 0,
            medianAnnualTax: 0
          },
          retirementIncome: {
            socialSecurityTaxed: false,
            pensionsTaxed: false,
            iraDistributionsTaxed: false,
            retirementIncomeExemption: 0,
            retirementIncomeExemptionAgeRequirement: 0
          },
          vehicleTax: {
            rate: 0,
            hasRelief: false,
            isCountyBased: false,
            specialAssessmentRules: ""
          },
          costOfLivingIndex: 100,
          lifestyleTags: []
        }
      }
    }
    
    // Log some stats about the income tax brackets
    let statesWithIncomeTax = 0
    let totalBrackets = 0
    for (const stateCode in stateData) {
      if (stateData[stateCode].incomeTax?.hasIncomeTax) {
        statesWithIncomeTax++;
        totalBrackets += stateData[stateCode].incomeTax.brackets.single.length;
        totalBrackets += stateData[stateCode].incomeTax.brackets.married.length;
        totalBrackets += stateData[stateCode].incomeTax.brackets.headOfHousehold.length;
        totalBrackets += stateData[stateCode].incomeTax.brackets.marriedSeparate.length; // Added marriedSeparate count
      }
    }
    console.log(`States with income tax: ${statesWithIncomeTax}`)
    console.log(`Total tax brackets: ${totalBrackets}`)

    // Split the data into two files (first half and second half alphabetically)
    const stateKeys = Object.keys(stateData).sort()
    const midpoint = Math.ceil(stateKeys.length / 2)
    
    const firstHalfStates = stateKeys.slice(0, midpoint)
    const secondHalfStates = stateKeys.slice(midpoint)
    
    firstHalfData = {}
    secondHalfData = {}
    
    firstHalfStates.forEach(stateCode => {
      firstHalfData[stateCode] = stateData[stateCode]
    })
    
    secondHalfStates.forEach(stateCode => {
      secondHalfData[stateCode] = stateData[stateCode]
    })
    
    // Write the data to files
    fs.writeFileSync(outputPath1, JSON.stringify(firstHalfData, null, 2))
    fs.writeFileSync(outputPath2, JSON.stringify(secondHalfData, null, 2))
    
    console.log(`Data saved to ${outputPath1} and ${outputPath2}`)
    console.log(`Updated ${Object.keys(stateData).length} states`)

    return stateData
  } catch (error) {
    console.error("Error updating tax brackets:", error)
    throw error
  }
}

// Run the update
updateTaxBrackets()
  .then(() => {
    console.log("Update completed successfully!")
  })
  .catch(error => {
    console.error("Update failed:", error)
    process.exit(1)
  })