import fs from 'fs';
import path from 'path';

async function integrateTaxRatesAndSave() {
  try {
    console.log('🔄 Starting tax rate integration...');
    
    // Fetch the cleaned CSV data
    console.log('📥 Fetching cleaned CSV data...');
    const csvResponse = await fetch('https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/state-tax-data-cleaned%20-%20Copy-AHwXIR5A4cGSZ10FBTbzNTeGFCuDbm.csv');
    
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.status}`);
    }
    
    const csvText = await csvResponse.text();
    
    // Parse CSV data
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const csvData = {};
    lines.slice(1).forEach(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      if (record['State Code']) {
        csvData[record['State Code']] = record;
      }
    });
    
    console.log(`✅ Parsed CSV data for ${Object.keys(csvData).length} states`);
    
    // Fetch existing JSON files
    console.log('📥 Fetching existing state tax data files...');
    
    const [stateData1Response, stateData2Response] = await Promise.all([
      fetch('https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/state-tax-data-6GxBQXuDowLXV6kCp86KUBy4ZDNNaq.json'),
      fetch('https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/state-tax-data-2-38LpXum19s243u11nazyWPwIfKSUgB.json')
    ]);
    
    const stateData1 = await stateData1Response.json();
    const stateData2 = await stateData2Response.json();
    
    console.log(`✅ Loaded state data 1: ${Object.keys(stateData1).length} states`);
    console.log(`✅ Loaded state data 2: ${Object.keys(stateData2).length} states`);
    
    // Function to update sales tax data for a state
    function updateStateSalesTax(stateCode, csvRecord, stateObj) {
      if (!csvRecord || !stateObj.salesTax) return false;
      
      let updated = false;
      
      // Update state rate and average local rate
      const stateRate = parseFloat(csvRecord['Sales Tax Rate']) || 0;
      const avgLocalRate = parseFloat(csvRecord['Avg Local Rate']) || 0;
      
      if (stateObj.salesTax.stateRate !== stateRate) {
        stateObj.salesTax.stateRate = stateRate;
        updated = true;
      }
      
      if (stateObj.salesTax.averageLocalRate !== avgLocalRate) {
        stateObj.salesTax.averageLocalRate = avgLocalRate;
        updated = true;
      }
      
      if (stateObj.salesTax.combinedRate !== stateRate + avgLocalRate) {
        stateObj.salesTax.combinedRate = stateRate + avgLocalRate;
        updated = true;
      }
      
      // Update category-specific rates
      const categoryMappings = {
        'groceries': {
          taxableField: 'Groceries Taxable',
          rateField: 'Groceries Rate'
        },
        'preparedFood': {
          taxableField: 'Prepared Food Taxable',
          rateField: 'Prepared Food Rate'
        },
        'utilities': {
          taxableField: 'Utilities Taxable',
          rateField: 'Utilities Rate'
        },
        'services': {
          taxableField: 'Services Taxable',
          rateField: 'Services Rate'
        },
        'digitalGoods': {
          taxableField: 'Digital Goods Taxable',
          rateField: 'Digital Goods Rate'
        },
        'medicine': {
          taxableField: 'Medicine Taxable',
          rateField: 'Medicine Rate'
        },
        'streamingSubscriptions': {
          taxableField: 'Streaming Taxable',
          rateField: 'Streaming Rate'
        }
      };
      
      Object.entries(categoryMappings).forEach(([category, mapping]) => {
        if (stateObj.salesTax.categories && stateObj.salesTax.categories[category]) {
          const taxable = csvRecord[mapping.taxableField]?.toLowerCase() === 'true';
          const rate = parseFloat(csvRecord[mapping.rateField]) || 0;
          
          if (stateObj.salesTax.categories[category].taxable !== taxable) {
            stateObj.salesTax.categories[category].taxable = taxable;
            updated = true;
          }
          
          if (stateObj.salesTax.categories[category].rate !== rate) {
            stateObj.salesTax.categories[category].rate = rate;
            updated = true;
          }
        }
      });
      
      return updated;
    }
    
    // Update both state data objects
    let updatedStates1 = 0;
    let updatedStates2 = 0;
    
    console.log('🔄 Updating state data 1...');
    Object.keys(stateData1).forEach(stateCode => {
      const csvRecord = csvData[stateCode];
      if (updateStateSalesTax(stateCode, csvRecord, stateData1[stateCode])) {
        updatedStates1++;
      }
    });
    
    console.log('🔄 Updating state data 2...');
    Object.keys(stateData2).forEach(stateCode => {
      const csvRecord = csvData[stateCode];
      if (updateStateSalesTax(stateCode, csvRecord, stateData2[stateCode])) {
        updatedStates2++;
      }
    });
    
    console.log(`✅ Updated ${updatedStates1} states in state data 1`);
    console.log(`✅ Updated ${updatedStates2} states in state data 2`);
    
    // Create output directory
    const outputDir = 'updated-tax-data';
    console.log(`\n💾 Creating output directory: ${outputDir}`);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Created directory: ${outputDir}`);
    } else {
      console.log(`✅ Directory already exists: ${outputDir}`);
    }
    
    // Save updated files
    const file1Path = path.join(outputDir, 'state-tax-data-updated.json');
    const file2Path = path.join(outputDir, 'state-tax-data-2-updated.json');
    
    console.log('\n💾 Saving updated files...');
    
    fs.writeFileSync(file1Path, JSON.stringify(stateData1, null, 2));
    console.log(`✅ Saved updated state-tax-data to: ${file1Path}`);
    
    fs.writeFileSync(file2Path, JSON.stringify(stateData2, null, 2));
    console.log(`✅ Saved updated state-tax-data-2 to: ${file2Path}`);
    
    // Create a summary file
    const summaryPath = path.join(outputDir, 'integration-summary.json');
    const summary = {
      integrationDate: new Date().toISOString(),
      csvStatesProcessed: Object.keys(csvData).length,
      stateData1: {
        totalStates: Object.keys(stateData1).length,
        updatedStates: updatedStates1
      },
      stateData2: {
        totalStates: Object.keys(stateData2).length,
        updatedStates: updatedStates2
      },
      sourceFiles: {
        csv: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/state-tax-data-cleaned%20-%20Copy-VTu8KkK3gG62Mz3mhVo2vzHminczIC.csv',
        stateData1: 'https://blobs.vusercontent.net/blob/state-tax-data-FMCAPbX7bY6RUhtlX32jZQxWumeoDI.json',
        stateData2: 'https://blobs.vusercontent.net/blob/state-tax-data-2-rqzUSyIf8fqRct5FnOsAR8p6Pt447k.json'
      }
    };
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Saved integration summary to: ${summaryPath}`);
    
    // Show sample of updated data
    console.log('\n📊 Sample of updated data (California):');
    if (stateData1.CA) {
      console.log('State Data 1 - CA Sales Tax:');
      console.log(JSON.stringify(stateData1.CA.salesTax, null, 2));
    }
    
    // Show states with highest grocery tax rates
    console.log('\n🏪 States with grocery taxes:');
    const groceryTaxStates = [];
    Object.entries(stateData1).forEach(([code, data]) => {
      if (data.salesTax?.categories?.groceries?.taxable && data.salesTax.categories.groceries.rate > 0) {
        groceryTaxStates.push({
          state: code,
          rate: data.salesTax.categories.groceries.rate
        });
      }
    });
    
    groceryTaxStates
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
      .forEach(state => {
        console.log(`${state.state}: ${(state.rate * 100).toFixed(2)}%`);
      });
    
    // Show states with highest digital goods tax rates
    console.log('\n💻 States with highest digital goods tax rates:');
    const digitalTaxStates = [];
    Object.entries(stateData1).forEach(([code, data]) => {
      if (data.salesTax?.categories?.digitalGoods?.taxable && data.salesTax.categories.digitalGoods.rate > 0) {
        digitalTaxStates.push({
          state: code,
          rate: data.salesTax.categories.digitalGoods.rate
        });
      }
    });
    
    digitalTaxStates
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)
      .forEach(state => {
        console.log(`${state.state}: ${(state.rate * 100).toFixed(2)}%`);
      });
    
    console.log('\n🎉 Tax rate integration completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`- Processed ${Object.keys(csvData).length} states from CSV`);
    console.log(`- Updated ${updatedStates1} states in state-tax-data`);
    console.log(`- Updated ${updatedStates2} states in state-tax-data-2`);
    console.log(`- Found ${groceryTaxStates.length} states with grocery taxes`);
    console.log(`- Found ${digitalTaxStates.length} states with digital goods taxes`);
    
    console.log('\n📁 Files saved to:');
    console.log(`- ${file1Path}`);
    console.log(`- ${file2Path}`);
    console.log(`- ${summaryPath}`);
    
    return {
      stateData1,
      stateData2,
      summary: {
        totalStates: Object.keys(csvData).length,
        updatedStates1,
        updatedStates2,
        groceryTaxStates: groceryTaxStates.length,
        digitalTaxStates: digitalTaxStates.length
      }
    };
    
  } catch (error) {
    console.error('❌ Error integrating tax rates:', error);
    throw error;
  }
}

integrateTaxRatesAndSave();