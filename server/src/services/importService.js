import { Account } from "../models/Account.js";

export class ImportError extends Error {}

const REQUIRED_FIELDS = ["name", "owner", "arr", "healthScore", "renewalDate"];

/**
 * Imports accounts from spreadsheet rows (the frontend converts the CSV to
 * JSON, so every value arrives as a string).
 */
export async function importAccounts(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ImportError("rows must be a non-empty array");
  }

  rows.forEach((row, i) => {
    for (const field of REQUIRED_FIELDS) {
      if (row[field] === undefined || row[field] === null || String(row[field]).trim() === "") {
        throw new ImportError(`Row ${i + 1} is missing ${field}`);
      }
    }
  });

  const now = new Date();
  const docs = rows.map((row) => ({
    name: String(row.name).trim(),
    owner: String(row.owner).trim(),
    segment: row.segment || "SMB",
    arr: row.arr,
    healthScore: row.healthScore,
    renewalDate: new Date(row.renewalDate),
    source: "import",
    notes: row.notes || "",
    createdAt: now,
    updatedAt: now,
  }));

  // Spreadsheets can have thousands of rows, so write straight through the
  // driver in one round trip instead of saving documents one by one.
  const result = await Account.collection.insertMany(docs);
  return { insertedCount: result.insertedCount };
}
