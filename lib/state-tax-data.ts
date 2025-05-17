import type { StateTaxData } from "./types"

// Cache for loaded data
let cachedData: Record<string, StateTaxData> | null = null

/**
 * Load state tax data from JSON files
 */
export async function loadStateTaxData(): Promise<Record<string, StateTaxData>> {
  if (cachedData) {
    return cachedData
  }

  try {
    // Load data from both JSON files
    const [data1Response, data2Response, taxBracketsResponse] = await Promise.all([
      fetch("/data/state-tax-data.json"),
      fetch("/data/state-tax-data-2.json"),
      fetch("/data/state-tax-brackets.json"),
    ])

    const [data1, data2, taxBrackets] = await Promise.all([
      data1Response.json(),
      data2Response.json(),
      taxBracketsResponse.json(),
    ])

    // Merge the data
    cachedData = { ...data1, ...data2 }

    // Update income tax brackets with the new data
    Object.keys(taxBrackets).forEach((stateCode) => {
      if (cachedData && cachedData[stateCode]) {
        // Update income tax data
        if (taxBrackets[stateCode].incomeTax) {
          cachedData[stateCode].incomeTax = taxBrackets[stateCode].incomeTax
        }
      }
    })

    return cachedData
  } catch (error) {
    console.error("Error loading state tax data:", error)
    throw new Error("Failed to load state tax data")
  }
}

/**
 * Get state tax data for a specific state
 */
export async function getStateTaxData(stateCode: string): Promise<StateTaxData | null> {
  const data = await loadStateTaxData()
  return data[stateCode] || null
}

/**
 * For backward compatibility - synchronous export
 * Note: This will be empty on first render in client components
 */
export const stateTaxData: Record<string, StateTaxData> = {}

// Initialize data if in browser
if (typeof window !== "undefined") {
  loadStateTaxData()
    .then((data) => {
      Object.assign(stateTaxData, data)
    })
    .catch((err) => {
      console.error("Failed to preload state tax data:", err)
    })
}

// Export a promise for async access
export const stateTaxDataPromise = loadStateTaxData()

// Define types for tax brackets
export interface StateTaxBracket {
  min: number
  max: number | null
  rate: number
}

export interface FilingStatusBrackets {
  single: StateTaxBracket[]
  "married-joint": StateTaxBracket[]
  "married-separate": StateTaxBracket[]
  "head-of-household": StateTaxBracket[]
}
