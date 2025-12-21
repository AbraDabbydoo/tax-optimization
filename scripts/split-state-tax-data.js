// scripts/split-state-tax-data.js
// Script to split state-tax-data-2-updated.json into per-state files under public/updated-tax-data/2025/{STATE}.json

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../public/updated-tax-data/state-tax-data-2-updated.json');
const OUTPUT_DIR = path.join(__dirname, '../public/updated-tax-data/2025');

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('Input file not found:', INPUT_FILE);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  const data = JSON.parse(raw);
  let count = 0;
  for (const [state, stateData] of Object.entries(data)) {
    const outFile = path.join(OUTPUT_DIR, `${state}.json`);
    fs.writeFileSync(outFile, JSON.stringify(stateData, null, 2));
    count++;
  }
  console.log(`Split ${count} states into ${OUTPUT_DIR}`);
}

main();
