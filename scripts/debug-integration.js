async function debugTaxRateIntegration() {
  try {
    console.log('🔍 Starting debug analysis...');
    
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
    console.log('CSV States:', Object.keys(csvData).sort().join(', '));
    
    // Fetch existing JSON files
    console.log('\n📥 Fetching existing state tax data files...');
    
    const [stateData1Response, stateData2Response] = await Promise.all([
      fetch('https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/state-tax-data-6GxBQXuDowLXV6kCp86KUBy4ZDNNaq.json'),
      fetch('https://i2rutzwfxfzibaev.public.blob.vercel-storage.com/state-tax-data-2-38LpXum19s243u11nazyWPwIfKSUgB.json')
    ]);
    
    const stateData1 = await stateData1Response.json();
    const stateData2 = await stateData2Response.json();
    
    console.log(`✅ Loaded state data 1: ${Object.keys(stateData1).length} states`);
    console.log('State Data 1 States:', Object.keys(stateData1).sort().join(', '));
    
    console.log(`\n✅ Loaded state data 2: ${Object.keys(stateData2).length} states`);
    console.log('State Data 2 States:', Object.keys(stateData2).sort().join(', '));
    
    // Find missing states
    const csvStates = new Set(Object.keys(csvData));
    const json1States = new Set(Object.keys(stateData1));
    const json2States = new Set(Object.keys(stateData2));
    
    console.log('\n🔍 ANALYSIS:');
    
    // States in CSV but not in JSON files
    const missingFromJson1 = [...csvStates].filter(state => !json1States.has(state));
    const missingFromJson2 = [...csvStates].filter(state => !json2States.has(state));
    
    console.log('\n❌ States in CSV but missing from JSON 1:', missingFromJson1.length > 0 ? missingFromJson1.join(', ') : 'None');
    console.log('❌ States in CSV but missing from JSON 2:', missingFromJson2.length > 0 ? missingFromJson2.join(', ') : 'None');
    
    // States in JSON but not in CSV
    const missingFromCsv1 = [...json1States].filter(state => !csvStates.has(state));
    const missingFromCsv2 = [...json2States].filter(state => !csvStates.has(state));
    
    console.log('\n⚠️  States in JSON 1 but missing from CSV:', missingFromCsv1.length > 0 ? missingFromCsv1.join(', ') : 'None');
    console.log('⚠️  States in JSON 2 but missing from CSV:', missingFromCsv2.length > 0 ? missingFromCsv2.join(', ') : 'None');
    
    // Function to check if update would occur
    function wouldUpdate(stateCode, csvRecord, stateObj) {
      if (!csvRecord || !stateObj.salesTax) return { updated: false, reason: 'Missing CSV record or salesTax object' };
      
      const reasons = [];
      
      // Check state rate and average local rate
      const stateRate = parseFloat(csvRecord['Sales Tax Rate']) || 0;
      const avgLocalRate = parseFloat(csvRecord['Avg Local Rate']) || 0;
      
      if (stateObj.salesTax.stateRate !== stateRate) {
        reasons.push(`State rate: ${stateObj.salesTax.stateRate} → ${stateRate}`);
      }
      
      if (stateObj.salesTax.averageLocalRate !== avgLocalRate) {
        reasons.push(`Avg local rate: ${stateObj.salesTax.averageLocalRate} → ${avgLocalRate}`);
      }
      
      if (stateObj.salesTax.combinedRate !== stateRate + avgLocalRate) {
        reasons.push(`Combined rate: ${stateObj.salesTax.combinedRate} → ${stateRate + avgLocalRate}`);
      }
      
      // Check category-specific rates
      const categoryMappings = {
        'groceries': { taxableField: 'Groceries Taxable', rateField: 'Groceries Rate' },
        'preparedFood': { taxableField: 'Prepared Food Taxable', rateField: 'Prepared Food Rate' },
        'utilities': { taxableField: 'Utilities Taxable', rateField: 'Utilities Rate' },
        'services': { taxableField: 'Services Taxable', rateField: 'Services Rate' },
        'digitalGoods': { taxableField: 'Digital Goods Taxable', rateField: 'Digital Goods Rate' },
        'medicine': { taxableField: 'Medicine Taxable', rateField: 'Medicine Rate' },
        'streamingSubscriptions': { taxableField: 'Streaming Taxable', rateField: 'Streaming Rate' }
      };
      
      Object.entries(categoryMappings).forEach(([category, mapping]) => {
        if (stateObj.salesTax.categories && stateObj.salesTax.categories[category]) {
          const taxable = csvRecord[mapping.taxableField]?.toLowerCase() === 'true';
          const rate = parseFloat(csvRecord[mapping.rateField]) || 0;
          
          if (stateObj.salesTax.categories[category].taxable !== taxable) {
            reasons.push(`${category} taxable: ${stateObj.salesTax.categories[category].taxable} → ${taxable}`);
          }
          
          if (stateObj.salesTax.categories[category].rate !== rate) {
            reasons.push(`${category} rate: ${stateObj.salesTax.categories[category].rate} → ${rate}`);
          }
        }
      });
      
      return { updated: reasons.length > 0, reasons };
    }
    
    // Check which states would be updated and which wouldn't
    console.log('\n🔍 DETAILED UPDATE ANALYSIS:');
    
    console.log('\n📊 STATE DATA 1 ANALYSIS:');
    const notUpdated1 = [];
    const updated1 = [];
    
    Object.keys(stateData1).forEach(stateCode => {
      const csvRecord = csvData[stateCode];
      const updateInfo = wouldUpdate(stateCode, csvRecord, stateData1[stateCode]);
      
      if (updateInfo.updated) {
        updated1.push(stateCode);
      } else {
        notUpdated1.push({ state: stateCode, reason: updateInfo.reason || 'No changes needed' });
      }
    });
    
    console.log(`✅ States that would be updated (${updated1.length}):`, updated1.join(', '));
    console.log(`❌ States that would NOT be updated (${notUpdated1.length}):`);
    notUpdated1.forEach(item => {
      console.log(`   ${item.state}: ${item.reason}`);
    });
    
    console.log('\n📊 STATE DATA 2 ANALYSIS:');
    const notUpdated2 = [];
    const updated2 = [];
    
    Object.keys(stateData2).forEach(stateCode => {
      const csvRecord = csvData[stateCode];
      const updateInfo = wouldUpdate(stateCode, csvRecord, stateData2[stateCode]);
      
      if (updateInfo.updated) {
        updated2.push(stateCode);
      } else {
        notUpdated2.push({ state: stateCode, reason: updateInfo.reason || 'No changes needed' });
      }
    });
    
    console.log(`✅ States that would be updated (${updated2.length}):`, updated2.join(', '));
    console.log(`❌ States that would NOT be updated (${notUpdated2.length}):`);
    notUpdated2.forEach(item => {
      console.log(`   ${item.state}: ${item.reason}`);
    });
    
    // Show sample CSV data for states that aren't being updated
    if (notUpdated1.length > 0) {
      const sampleState = notUpdated1[0].state;
      console.log(`\n📋 Sample CSV data for ${sampleState}:`);
      if (csvData[sampleState]) {
        console.log(JSON.stringify(csvData[sampleState], null, 2));
      } else {
        console.log('No CSV data found for this state');
      }
      
      console.log(`\n📋 Current JSON data for ${sampleState}:`);
      console.log(JSON.stringify(stateData1[sampleState]?.salesTax, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error in debug analysis:', error);
    throw error;
  }
}

debugTaxRateIntegration();