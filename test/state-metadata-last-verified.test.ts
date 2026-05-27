import fs from "fs";
import path from "path";

describe("All state metadata last_verified dates are recent", () => {
  const STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
  ];
  const YEAR = "2025";
  const MAX_AGE_DAYS = 400;
  const today = new Date();

  function findAllMetadata(obj: any, found: any[] = []) {
    if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        if (key === "metadata" && obj[key]?.last_verified) {
          found.push(obj[key]);
        } else {
          findAllMetadata(obj[key], found);
        }
      }
    }
    return found;
  }

  for (const state of STATES) {
    it(`all metadata in ${state} is verified within ${MAX_AGE_DAYS} days`, () => {
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "updated-tax-data",
        YEAR,
        `${state}.json`
      );
      expect(fs.existsSync(filePath)).toBe(true);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const metadatas = findAllMetadata(data);
      expect(metadatas.length).toBeGreaterThan(0);
      for (const meta of metadatas) {
        const lastVerified = new Date(meta.last_verified);
        const ageDays = (today.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
        expect(ageDays).toBeLessThan(MAX_AGE_DAYS);
      }
    });
  }
});
