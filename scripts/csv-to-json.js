import fs from "fs"
import { parse } from "csv-parse/sync"

// Read the CSV file
const csvData = fs.readFileSync("state-tax-data.csv", "utf8")

// Parse the CSV data
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
})

// Create an object to store the state data
const stateData = {}

// Process each record
records.forEach((record) => {
  const stateCode = record.stateCode

  // Create state object if it doesn't exist
  if (!stateData[stateCode]) {
    stateData[stateCode] = {
      name: record.stateName,
      abbreviation: stateCode,
      salesTax: {
        stateRate: Number.parseFloat(record.salesTaxRate),
        averageLocalRate: Number.parseFloat(record.avgLocalRate),
        combinedRate: Number.parseFloat(record.combinedRate),
        categories: {
          groceries: {
            taxable: record.groceriesTaxable === "TRUE",
            rate: Number.parseFloat(record.groceriesRate),
          },
          preparedFood: {
            taxable: record.preparedFoodTaxable === "TRUE",
            rate: Number.parseFloat(record.preparedFoodRate),
          },
          utilities: {
            taxable: record.utilitiesTaxable === "TRUE",
            rate: Number.parseFloat(record.utilitiesRate),
          },
          services: {
            taxable: record.servicesTaxable === "TRUE",
            rate: Number.parseFloat(record.servicesRate),
          },
          digitalGoods: {
            taxable: record.digitalGoodsTaxable === "TRUE",
            rate: Number.parseFloat(record.digitalGoodsRate),
          },
          medicine: {
            taxable: record.medicineTaxable === "TRUE",
            rate: Number.parseFloat(record.medicineRate),
          },
          streamingSubscriptions: {
            taxable: record.streamingTaxable === "TRUE",
            rate: Number.parseFloat(record.streamingRate),
          },
        },
      },
      // Add other tax categories from your existing data
    }
  }
})

// Write the JSON data to a file
fs.writeFileSync("state-tax-data.json", JSON.stringify(stateData, null, 2))

console.log("Conversion complete!")
