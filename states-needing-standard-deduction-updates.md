### States needing standard deduction updates

The calculator now prefers the updated files in `public/updated-tax-data/` (with fallback to `public/data/`). Update the `incomeTax.standardDeduction` object for each state listed below.

Each entry shows the state code and the file to edit.

- **AK**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **CO**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **CT**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **DE**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **FL**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **GA**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **HI**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **IA**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **ID**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **IL**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **IN**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **KS**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **KY**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **LA**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MA**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MD**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **ME**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MI**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MN**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MO**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MS**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **MT**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **NE**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)
- **NV**: `public/updated-tax-data/state-tax-data-updated.json` (zeros; missing `marriedSeparate`)

- **MT**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NC**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **ND**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NE**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NH**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NJ**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NM**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NV**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **NY**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **OH**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **OK**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **OR**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **PA**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **RI**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **SC**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **SD**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **TN**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **TX**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **UT**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **VA**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **VT**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **WA**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **WI**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **WV**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)
- **WY**: `public/updated-tax-data/state-tax-data-2-updated.json` (zeros; missing `marriedSeparate`)

Notes:
- Replace zeros with actual standard deduction amounts (or bracket arrays where applicable).
- Add any missing filing statuses (commonly `marriedSeparate`).

Example structure to use (flat values):

```json
"standardDeduction": {
  "single": 5540,
  "marriedSeparate": 5540,
  "married": 11080,
  "headOfHousehold": 11080
}
```

Example structure (AGI-based brackets):

```json
"standardDeduction": {
  "single": [
    { "agiMin": 0, "agiMax": 25000, "deduction": 3000 },
    { "agiMin": 25001, "agiMax": null, "deduction": 2000 }
  ],
  "married": [
    { "agiMin": 0, "agiMax": 25000, "deduction": 6000 },
    { "agiMin": 25001, "agiMax": null, "deduction": 4000 }
  ]
}
```

