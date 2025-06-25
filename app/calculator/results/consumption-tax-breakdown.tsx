import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ConsumptionTaxBreakdownProps {
  breakdown: Record<string, number>
  totalConsumptionTax: number
}

// Map of category keys to display names
const categoryNames: Record<string, string> = {
  groceries: "Groceries",
  preparedFood: "Prepared Food & Restaurants",
  utilities: "Utilities",
  services: "Services",
  digitalGoods: "Digital Goods",
  medicine: "Medicine",
  streamingSubscriptions: "Streaming & Subscriptions",
}

export function ConsumptionTaxBreakdown({ breakdown, totalConsumptionTax }: ConsumptionTaxBreakdownProps) {
  // Filter out zero values
  const nonZeroCategories = Object.entries(breakdown)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a) // Sort by value, highest first

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumption Tax Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {nonZeroCategories.length > 0 ? (
          <div className="space-y-2">
            {nonZeroCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span>{categoryNames[category] || category}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-4 flex justify-between items-center font-bold">
              <span>Total Consumption Tax</span>
              <span>{formatCurrency(totalConsumptionTax)}</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No consumption taxes applicable.</p>
        )}
      </CardContent>
    </Card>
  )
}
