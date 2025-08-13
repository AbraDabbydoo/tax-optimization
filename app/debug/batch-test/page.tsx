"use client"

import { useState } from "react"

const allStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function BatchTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simple test inputs (customize as needed)
  const testInputs = {
    annualIncome: "75000",
    filingStatus: "single",
    age: "65",
    socialSecurityIncome: "24000",
    homeValue: "300000",
    vehicleValue: "25000",
  };

  const runBatchTest = async () => {
    setLoading(true);
    setResults([]);
    setError(null);
    const batchResults = [];
    for (const stateCode of allStates) {
      try {
        const formData = new FormData();
        formData.append("residenceState", stateCode);
        formData.append("employmentState", stateCode);
        formData.append("filingStatus", testInputs.filingStatus);
        formData.append("preferredLifestyle", "indifferent");
        formData.append("regionPreference", "indifferent");
        formData.append("dependents", "0");
        formData.append("age", testInputs.age);
        formData.append("spouseAge", testInputs.age);
        formData.append("annualIncome", testInputs.annualIncome);
        formData.append("retirementIncome", "0");
        formData.append("socialSecurityIncome", testInputs.socialSecurityIncome);
        formData.append("privatePensionIncome", "0");
        formData.append("teacherPension", "0");
        formData.append("policePension", "0");
        formData.append("firefighterPension", "0");
        formData.append("otherGovernmentPension", "0");
        formData.append("militaryRetirementPay", "0");
        formData.append("iraDistributions", "0");
        formData.append("k401Distributions", "0");
        formData.append("investmentIncome", "0");
        formData.append("interestIncome", "0");
        formData.append("dividendsIncome", "0");
        formData.append("rentalIncome", "0");
        formData.append("royaltyIncome", "0");
        formData.append("trustIncome", "0");
        formData.append("homeValue", testInputs.homeValue);
        formData.append("currentPropertyTax", "0");
        formData.append("monthlyRent", "0");
        formData.append("futurePlans", "buy");
        formData.append("housingBudget", "2500");
        formData.append("hasDependents", "no");
        formData.append("vehicleCount", "1");
        formData.append("vehicleValue", testInputs.vehicleValue);
        formData.append("groceries", "0");
        formData.append("preparedFood", "0");
        formData.append("utilities", "0");
        formData.append("services", "0");
        formData.append("digitalGoods", "0");
        formData.append("medicine", "0");
        formData.append("streamingSubscriptions", "0");
        formData.append("spouse1QualifyingJob", "no");
        formData.append("spouse2QualifyingJob", "no");
        formData.append("privatePensionEmployeeContributionPortion", "");
        formData.append("kyMilitaryRetiredBefore1998", "no");
        formData.append("kyTeacherPoliceFirePre1998Percent", "0");
        formData.append("ncBaileyExemption", "no");

        const response = await fetch("/api/debug/calculate-tax", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        batchResults.push({ 
          state: stateCode, 
          totalTax: result.totalTaxBurden, 
          incomeTax: result.incomeTaxBurden, 
          propertyTax: result.propertyTaxBurden, 
          salesTax: result.salesTaxBurden,
          retirementTax: result.retirementTaxBurden
        });
      } catch (err: any) {
        batchResults.push({ state: stateCode, error: err.message });
      }
    }
    setResults(batchResults);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Batch State Tax Testing</h1>
      <button onClick={runBatchTest} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded mb-4">
        {loading ? "Running..." : "Run Batch Test (All States)"}
      </button>
      {results.length > 0 && (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2">State</th>
              <th className="border px-2">Total Tax</th>
              <th className="border px-2">Income Tax</th>
              <th className="border px-2">Property Tax</th>
              <th className="border px-2">Sales Tax</th>
              <th className="border px-2">Retirement Tax</th>
              <th className="border px-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.state} className={r.error ? "bg-red-100" : ""}>
                <td className="border px-2 font-mono">{r.state}</td>
                <td className="border px-2">{r.totalTax !== undefined ? `$${r.totalTax.toFixed(2)}` : "-"}</td>
                <td className="border px-2">{r.incomeTax !== undefined ? `$${r.incomeTax.toFixed(2)}` : "-"}</td>
                <td className="border px-2">{r.propertyTax !== undefined ? `$${r.propertyTax.toFixed(2)}` : "-"}</td>
                <td className="border px-2">{r.salesTax !== undefined ? `$${r.salesTax.toFixed(2)}` : "-"}</td>
                <td className="border px-2">{r.retirementTax !== undefined ? `$${r.retirementTax.toFixed(2)}` : "-"}</td>
                <td className="border px-2 text-red-600">{r.error || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
} 