import fs from 'fs';
import path from 'path';

async function fixTaxRates() {
  try {
    console.log('🔍 Analyzing tax rate data for errors...\n');
    
    // Load the updated files
    const data1Path = path.join(process.cwd(), 'updated-tax-data', 'state-tax-data-updated.json');
    const data2Path = path.join(process.cwd(), 'updated-tax-data', 'state-tax-data-2-updated.json');
    
    const data1 = JSON.parse(fs.readFileSync(data1Path, 'utf8'));
    const data2 = JSON.parse(fs.readFileSync(data2Path, 'utf8'));
    
    const allData = { ...data1, ...data2 };
    
    // Find states with unrealistic rates
    const problematicStates = [];
    const fixedStates = [];
    
    Object.entries(allData).forEach(([stateCode, stateData]) => {
      if (stateData.salesTax) {
        const stateRate = stateData.salesTax.stateRate;
        const combinedRate = stateData.salesTax.combinedRate;
        const avgLocalRate = stateData.salesTax.averageLocalRate;
        
        // Check for unrealistic rates (over 20% or 0.2 in decimal)
        const hasError = stateRate > 0.2 || combinedRate > 0.2 || avgLocalRate > 0.2;
        
        if (hasError) {
          problematicStates.push({
            state: stateCode,
            stateRate: stateRate,
            combinedRate: combinedRate,
            avgLocalRate: avgLocalRate
          });
          
          // Fix the rates by dividing by 100 if they seem to be in percentage form
          let fixedStateRate = stateRate > 0.2 ? stateRate / 100 : stateRate;
          let fixedCombinedRate = combinedRate > 0.2 ? combinedRate / 100 : combinedRate;
          let fixedAvgLocalRate = avgLocalRate > 0.2 ? avgLocalRate / 100 : avgLocalRate;
          
          // Ensure combined rate makes sense (should be state + local)
          if (Math.abs(fixedCombinedRate - (fixedStateRate + fixedAvgLocalRate)) > 0.01) {
            fixedCombinedRate = fixedStateRate + fixedAvgLocalRate;
          }
          
          // Apply fixes
          stateData.salesTax.stateRate = fixedStateRate;
          stateData.salesTax.combinedRate = fixedCombinedRate;
          stateData.salesTax.averageLocalRate = fixedAvgLocalRate;
          
          // Fix category rates if they're also wrong
          if (stateData.salesTax.categories) {
            Object.keys(stateData.salesTax.categories).forEach(category => {
              const categoryData = stateData.salesTax.categories[category];
              if (categoryData.rate > 0.2) {
                categoryData.rate = categoryData.rate / 100;
              }
              // If category rate is 0 but should use state rate, set it appropriately
              if (categoryData.taxable && categoryData.rate === 0) {
                categoryData.rate = fixedCombinedRate;
              }
            });
          }
          
          fixedStates.push({
            state: stateCode,
            oldStateRate: stateRate,
            newStateRate: fixedStateRate,
            oldCombinedRate: combinedRate,
            newCombinedRate: fixedCombinedRate
          });
        }
      }
    });
    
    console.log(`❌ Found ${problematicStates.length} states with unrealistic tax rates:`);
    problematicStates.forEach(state => {
      console.log(`${state.state}: State ${(state.stateRate * 100).toFixed(2)}%, Combined ${(state.combinedRate * 100).toFixed(2)}%`);
    });
    
    console.log(`\n✅ Fixed ${fixedStates.length} states:`);
    fixedStates.forEach(state => {
      console.log(`${state.state}: ${(state.oldCombinedRate * 100).toFixed(2)}% → ${(state.newCombinedRate * 100).toFixed(2)}%`);
    });
    
    // Split data back into two files
    const stateCodesFile1 = Object.keys(data1);
    const stateCodesFile2 = Object.keys(data2);
    
    const fixedData1 = {};
    const fixedData2 = {};
    
    Object.entries(allData).forEach(([stateCode, stateData]) => {
      if (stateCodesFile1.includes(stateCode)) {
        fixedData1[stateCode] = stateData;
      } else if (stateCodesFile2.includes(stateCode)) {
        fixedData2[stateCode] = stateData;
      }
    });
    
    // Save fixed data
    fs.writeFileSync(data1Path, JSON.stringify(fixedData1, null, 2));
    fs.writeFileSync(data2Path, JSON.stringify(fixedData2, null, 2));
    
    console.log('\n💾 Saved corrected data files');
    
    // Verify a few key states
    console.log('\n🧪 Verification of corrected rates:');
    const testStates = ['TX', 'NY', 'CA', 'FL'];
    
    testStates.forEach(stateCode => {
      const stateData = allData[stateCode];
      if (stateData && stateData.salesTax) {
        console.log(`${stateCode}: State ${(stateData.salesTax.stateRate * 100).toFixed(2)}%, Combined ${(stateData.salesTax.combinedRate * 100).toFixed(2)}%`);
      }
    });
    
    // Show realistic ranges
    console.log('\n📊 Tax rate statistics after correction:');
    const rates = Object.values(allData)
      .filter(state => state.salesTax)
      .map(state => state.salesTax.combinedRate * 100)
      .sort((a, b) => a - b);
    
    console.log(`Lowest combined rate: ${rates[0].toFixed(2)}%`);
    console.log(`Highest combined rate: ${rates[rates.length - 1].toFixed(2)}%`);
    console.log(`Average combined rate: ${(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2)}%`);
    
    // Create a summary of the fixes
    const fixSummary = {
      fixDate: new Date().toISOString(),
      statesFixed: fixedStates.length,
      fixedStates: fixedStates,
      rateStatistics: {
        lowestRate: rates[0],
        highestRate: rates[rates.length - 1],
        averageRate: rates.reduce((a, b) => a + b, 0) / rates.length
      }
    };
    
    const summaryPath = path.join(process.cwd(), 'updated-tax-data', 'rate-fix-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(fixSummary, null, 2));
    
    console.log(`\n📋 Fix summary saved to: ${summaryPath}`);
    console.log('\n🎉 Tax rate correction completed!');
    
    return fixSummary;
    
  } catch (error) {
    console.error('❌ Error fixing tax rates:', error);
    throw error;
  }
}

fixTaxRates();