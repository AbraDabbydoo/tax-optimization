import fs from 'fs';
import path from 'path';

// Simple CSV parser using built-in functions
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse headers
  const headerLine = lines[0];
  const headers = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  headers.push(current.trim().replace(/^"|"$/g, ''));
  
  // Parse data rows
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    return record;
  });
}

// Simple CSV stringifier
function stringifyCSV(records) {
  if (records.length === 0) return '';
  
  const headers = Object.keys(records[0]);
  
  // Helper function to escape CSV values
  const escapeValue = (value) => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const csvLines = [headers.map(escapeValue).join(',')];
  
  records.forEach(record => {
    const values = headers.map(header => escapeValue(record[header] ?? ''));
    csvLines.push(values.join(','));
  });
  
  return csvLines.join('\n');
}

async function downloadAndCleanTaxData() {
  try {
    // Ensure directories exist
    const rawDir = 'data/raw';
    const processedDir = 'data/processed';
    
    console.log('Creating directory structure...');
    if (!fs.existsSync(rawDir)) {
      fs.mkdirSync(rawDir, { recursive: true });
      console.log(`✓ Created directory: ${rawDir}`);
    }
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
      console.log(`✓ Created directory: ${processedDir}`);
    }

    // Download original data
    console.log('\nDownloading original tax data...');
    const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/state-tax-data-35ePBnG9yhs8HJUcWIkUKqcLBpCyuj.csv');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const csvData = await response.text();
    console.log(`✓ Downloaded ${csvData.length} characters of data`);
    
    // Save original data
    const originalPath = path.join(rawDir, 'state-tax-data-original.csv');
    fs.writeFileSync(originalPath, csvData);
    console.log(`✓ Original data saved to: ${originalPath}`);
    
    // Parse data
    console.log('\nParsing and cleaning data...');
    const records = parseCSV(csvData);
    console.log(`✓ Parsed ${records.length} records`);
    
    if (records.length === 0) {
      throw new Error('No records found in CSV data');
    }
    
    // Show available columns
    console.log('Available columns:', Object.keys(records[0]));
    
    // Define column types based on the actual data
    const rateColumns = [
      'Sales Tax Rate', 'Avg Local Rate', 'Groceries Rate', 
      'Prepared Food Rate', 'Utilities Rate', 'Services Rate',
      'Digital Goods Rate', 'Medicine Rate', 'Streaming Rate'
    ];
    
    const booleanColumns = [
      'Groceries Taxable', 'Prepared Food Taxable', 'Utilities Taxable',
      'Services Taxable', 'Digital Goods Taxable', 'Medicine Taxable',
      'Streaming Taxable'
    ];
    
    const exemptionColumns = [
      'Groceries Exemptions', 'Prepared Food Exemptions', 'Utilities Exemptions',
      'Services Exemptions', 'Digital Goods Exemptions', 'Medicine Exemptions',
      'Streaming Exemptions'
    ];
    
    // Clean records
    console.log('Cleaning data...');
    const cleanedRecords = records.map((record, index) => {
      const cleaned = {};
      
      Object.keys(record).forEach(key => {
        const value = record[key];
        
        if (booleanColumns.includes(key)) {
          // Convert to proper boolean
          const lowerValue = value.toLowerCase().trim();
          cleaned[key] = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
        } 
        else if (rateColumns.includes(key)) {
          // Convert rates to numbers
          let numericValue = value.replace('%', '').trim();
          if (numericValue === '' || numericValue === 'N/A' || numericValue === 'n/a') {
            cleaned[key] = 0;
          } else {
            const parsed = parseFloat(numericValue);
            cleaned[key] = isNaN(parsed) ? 0 : parsed;
          }
        }
        else if (key === 'Last Updated') {
          // Standardize date format to YYYY-MM-DD
          if (value && value !== '' && value !== 'N/A') {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                cleaned[key] = date.toISOString().split('T')[0];
              } else {
                console.warn(`Could not parse date: ${value} for record ${index + 1}`);
                cleaned[key] = null;
              }
            } catch (e) {
              console.warn(`Could not parse date: ${value} for record ${index + 1}`);
              cleaned[key] = null;
            }
          } else {
            cleaned[key] = null;
          }
        }
        else if (key === 'State Code') {
          // Ensure state codes are uppercase
          cleaned[key] = value.toUpperCase().trim();
        }
        else if (exemptionColumns.includes(key)) {
          // Standardize exemption text
          if (!value || value.trim() === '' || value.toLowerCase() === 'n/a' || value.toLowerCase() === 'none') {
            cleaned[key] = 'None';
          } else {
            cleaned[key] = value.trim();
          }
        }
        else {
          // For other fields, just trim whitespace
          cleaned[key] = value.trim();
        }
      });
      
      return cleaned;
    });
    
    console.log(`✓ Cleaned ${cleanedRecords.length} records`);
    
    // Save cleaned data as CSV
    const cleanedCsv = stringifyCSV(cleanedRecords);
    const cleanedPath = path.join(processedDir, 'state-tax-data-cleaned.csv');
    fs.writeFileSync(cleanedPath, cleanedCsv);
    console.log(`✓ Cleaned CSV saved to: ${cleanedPath}`);
    
    // Save as JSON for easier programmatic access
    const jsonPath = path.join(processedDir, 'state-tax-data-cleaned.json');
    fs.writeFileSync(jsonPath, JSON.stringify(cleanedRecords, null, 2));
    console.log(`✓ Cleaned JSON saved to: ${jsonPath}`);
    
    // Create metadata file
    const metadata = {
      original_file: originalPath,
      cleaned_csv_file: cleanedPath,
      cleaned_json_file: jsonPath,
      processing_date: new Date().toISOString(),
      record_count: cleanedRecords.length,
      columns: Object.keys(cleanedRecords[0]),
      data_types: {
        boolean_columns: booleanColumns.filter(col => Object.keys(cleanedRecords[0]).includes(col)),
        numeric_columns: rateColumns.filter(col => Object.keys(cleanedRecords[0]).includes(col)),
        text_columns: exemptionColumns.filter(col => Object.keys(cleanedRecords[0]).includes(col)),
        date_columns: ['Last Updated'],
        code_columns: ['State Code']
      },
      cleaning_steps: [
        'Converted boolean strings to actual booleans',
        'Converted rate strings to numeric values',
        'Standardized date format to YYYY-MM-DD',
        'Normalized state codes to uppercase',
        'Standardized exemption text (empty/N/A values to "None")',
        'Trimmed whitespace from all fields',
        'Handled missing values appropriately'
      ]
    };
    
    const metadataPath = path.join(processedDir, 'cleaning-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✓ Metadata saved to: ${metadataPath}`);
    
    // Print sample of cleaned data
    console.log('\n📊 Sample of cleaned data:');
    console.log(JSON.stringify(cleanedRecords[0], null, 2));
    
    // Print summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`Total records: ${cleanedRecords.length}`);
    console.log(`Total columns: ${Object.keys(cleanedRecords[0]).length}`);
    
    // Count states with sales tax
    const statesWithSalesTax = cleanedRecords.filter(record => record['Sales Tax Rate'] > 0).length;
    console.log(`States with sales tax: ${statesWithSalesTax}`);
    
    // Average sales tax rate
    const avgSalesTax = cleanedRecords.reduce((sum, record) => sum + (record['Sales Tax Rate'] || 0), 0) / cleanedRecords.length;
    console.log(`Average sales tax rate: ${(avgSalesTax * 100).toFixed(2)}%`);
    
    console.log(`\n🎉 Data cleaning complete!`);
    console.log(`Files created:`);
    console.log(`  - ${originalPath}`);
    console.log(`  - ${cleanedPath}`);
    console.log(`  - ${jsonPath}`);
    console.log(`  - ${metadataPath}`);
    
    return cleanedRecords;
  } catch (error) {
    console.error('❌ Error in data cleaning process:', error);
    throw error;
  }
}

downloadAndCleanTaxData();