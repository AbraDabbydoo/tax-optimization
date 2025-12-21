import fs from "fs";
import path from "path";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

const YEARS = [2025];

describe("State × Year coverage", () => {
  for (const year of YEARS) {
    for (const state of STATES) {
      it(`should have data for ${state} in ${year}`, () => {
        const filePath = path.join(
          __dirname,
          "..",
          "public",
          "updated-tax-data",
          String(year),
          `${state}.json`
        );
        expect(fs.existsSync(filePath)).toBe(true);
      });
    }
  }
});
