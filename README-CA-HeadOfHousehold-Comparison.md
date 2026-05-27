# CA HeadOfHousehold Tax Calculation Comparison

This table compares the values used for California's HeadOfHousehold filing status in both the test's manual calculation and the main calculation logic.

| Value                | Test Calculation (`getEstimatedTax`) | Main Calculation (JSON/Logic) |
|----------------------|--------------------------------------|-------------------------------|
| Brackets             | [{min:0,max:21527,rate:1},{min:21528,max:51000,rate:2},{min:51001,max:65744,rate:4},{min:65745,max:81364,rate:6},{min:81365,max:96107,rate:8},{min:96108,max:490493,rate:9.3},{min:490494,max:588593,rate:10.3},{min:588594,max:980987,rate:11.3},{min:980988,max:null,rate:12.3}] | Same as test (from JSON)      |
| Standard Deduction   | 11080                                | 11080 (from JSON)             |
| Calculation Steps    | Subtract stdDeduction, apply brackets| Subtract stdDeduction, apply brackets |
| Failing Test Inputs  | $25,000, $75,000, $200,000           | $25,000, $75,000, $200,000    |
| Expected Tax         | 139.20, 1321.47, 12142.45            |                               |
| Actual Tax           | 170.83, 2573.69, 14111.69            |                               |
| Difference           | +31.63, +1252.22, +1969.25           |                               |

**Notes:**
- Both calculations use the same bracket and deduction values from the JSON.
- The main calculation produces higher tax values for CA HeadOfHousehold than the test expects.
- The difference suggests a logic mismatch in how taxable income is calculated or how brackets are applied.

## Next Steps
- Review the calculation logic for CA HeadOfHousehold in both the test and main function for differences in bracket application or additional credits/exemptions.
- Check if any other factors (e.g., personal exemptions, credits) are applied in the main logic but not in the test.
