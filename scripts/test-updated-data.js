import fs from "fs"
import path from "path"

async function testUpdatedData() {
  try {
    console.log("🔍 Testing updated tax data integration...\n")

    // Load updated files
    const data1Path = path.join(process.cwd(), "updated-tax-data", "state-tax-data-updated.json")
    const data2Path = path.join(process.cwd(), "updated-tax-data", "state-tax-data-2-updated.json")

    const data1 = JSON.parse(fs.readFileSync(data1Path, "utf8"))
    const data2 = JSON.parse(fs.readFileSync(data2Path, "utf8"))

    console.log(`📊 Loaded data for ${Object.keys(data1).length} states from file 1`)
    console.log(`📊 Loaded data for ${Object.keys(data2).length} states from file 2`)

    // Test a few states to verify category-specific data
    const testStates = ["CA", "TX", "FL", "NY"]

    console.log("\n🧪 Testing category-specific tax rates:\n")

    testStates.forEach((stateCode) => {
      const stateData = data1[stateCode] || data2[stateCode]

      if (stateData && stateData.salesTax && stateData.salesTax.categories) {
        console.log(`${stateCode} - ${stateData.name || stateCode}:`)
        console.log(`  State Rate: ${(stateData.salesTax.stateRate * 100).toFixed(2)}%`)
        console.log(`  Combined Rate: ${(stateData.salesTax.combinedRate * 100).toFixed(2)}%`)

        const categories = stateData.salesTax.categories
        Object.entries(categories).forEach(([category, info]) => {
          if (info.taxable) {
            console.log(`  ${category}: ${(info.rate * 100).toFixed(2)}% (taxable)`)
          } else {
            console.log(`  ${category}: Not taxable`)
          }
        })
        console.log("")
      }
    })

    // Test calculation with sample data
    console.log("💰 Sample calculation for California:")
    const caData = data1.CA
    if (caData && caData.salesTax) {
      const sampleExpenses = {
        groceries: 500, // $500/month
        preparedFood: 300, // $300/month
        utilities: 200, // $200/month
        digitalGoods: 50, // $50/month
        streamingSubscriptions: 75, // $75/month
      }

      let totalAnnualTax = 0

      Object.entries(sampleExpenses).forEach(([category, monthlyAmount]) => {
        const categoryInfo = caData.salesTax.categories[category]
        if (categoryInfo && categoryInfo.taxable) {
          const annualTax = monthlyAmount * 12 * categoryInfo.rate
          console.log(
            `  ${category}: $${monthlyAmount}/month * ${(categoryInfo.rate * 100).toFixed(2)}% = $${annualTax.toFixed(2)}/year`,
          )
          totalAnnualTax += annualTax
        } else {
          console.log(`  ${category}: $${monthlyAmount}/month * 0% (not taxable) = $0/year`)
        }
      })

      console.log(`  Total estimated annual sales tax: $${totalAnnualTax.toFixed(2)}`)
    }

    console.log("\n✅ Updated tax data integration test completed!")
  } catch (error) {
    console.error("❌ Error testing updated data:", error)
  }
}

testUpdatedData()
