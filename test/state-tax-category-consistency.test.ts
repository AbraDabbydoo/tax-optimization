// Cross-state consistency test for broad tax categories
// Run with: jest test/state-tax-category-consistency.test.ts

import fs from 'fs';
import path from 'path';

describe('State Tax Category Consistency', () => {
  const dataDir = path.join(__dirname, '../public/updated-tax-data/2025');
  const canonicalCategories = [
    'salesTax',
    'propertyTax',
    'retirementIncome',
    'vehicleTax',
    'incomeTax',
  ];
  const salesTaxSubcategories = [
    'groceries',
    'preparedFood',
    'utilities',
    'services',
    'digitalGoods',
    'medicine',
    'streamingSubscriptions',
  ];
  const incomeTaxSubcategories = [
    'standardDeduction',
    'personalExemption',
    'dependentExemption',
  ];

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const stateData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const missing: string[] = [];

    canonicalCategories.forEach(cat => {
      if (!(cat in stateData)) missing.push(cat);
    });

    // Check salesTax subcategories
    if (stateData.salesTax && stateData.salesTax.categories) {
      salesTaxSubcategories.forEach(sub => {
        if (!(sub in stateData.salesTax.categories)) missing.push(`salesTax.categories.${sub}`);
      });
    } else {
      salesTaxSubcategories.forEach(sub => missing.push(`salesTax.categories.${sub}`));
    }

    // Check incomeTax subcategories
    // Note: Some states use credits instead of exemptions (e.g., CA uses dependentExemptionCredit)
    if (stateData.incomeTax) {
      incomeTaxSubcategories.forEach(sub => {
        // Allow credit-based alternatives for exemptions
        if (sub === 'personalExemption' || sub === 'dependentExemption') {
          const hasExemption = sub in stateData.incomeTax;
          const hasCredit = 'dependentExemptionCredit' in stateData.incomeTax;
          if (!hasExemption && !hasCredit) {
            missing.push(`incomeTax.${sub}`);
          }
        } else if (!(sub in stateData.incomeTax)) {
          missing.push(`incomeTax.${sub}`);
        }
      });
    } else {
      incomeTaxSubcategories.forEach(sub => missing.push(`incomeTax.${sub}`));
    }

    test(`${file.replace('.json','')}: should have all canonical tax categories`, () => {
      expect(missing).toEqual([]);
    });
  });
});
