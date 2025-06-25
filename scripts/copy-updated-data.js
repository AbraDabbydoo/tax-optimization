import fs from "fs"
import path from "path"

// Create public/updated-tax-data directory if it doesn't exist
const publicDir = path.join(process.cwd(), "public", "updated-tax-data")
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
  console.log("✅ Created public/updated-tax-data directory")
}

// Copy updated files to public directory
const sourceDir = path.join(process.cwd(), "updated-tax-data")
const files = ["state-tax-data-updated.json", "state-tax-data-2-updated.json", "integration-summary.json"]

files.forEach((file) => {
  const sourcePath = path.join(sourceDir, file)
  const destPath = path.join(publicDir, file)

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    console.log(`✅ Copied ${file} to public directory`)
  } else {
    console.log(`❌ Source file not found: ${file}`)
  }
})

console.log("🎉 Updated tax data files copied to public directory!")
