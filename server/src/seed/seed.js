import { Account } from "../models/Account.js";
import { Task } from "../models/Task.js";
import { importAccounts } from "../services/importService.js";

/** A date `days` from today, at midnight UTC. */
export function daysFromNow(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

const isoDay = (days) => daysFromNow(days).toISOString().slice(0, 10);

// Accounts created by CSMs in the app.
const MANUAL_ACCOUNTS = [
  { name: "Acme Robotics", owner: "Ana Ruiz", segment: "Enterprise", arr: 240000, healthScore: 82, renewalDate: daysFromNow(74) },
  { name: "Bluefin Analytics", owner: "Ben Carter", segment: "Mid-Market", arr: 96000, healthScore: 35, renewalDate: daysFromNow(21) },
  { name: "Cobalt Learning", owner: "Chen Li", segment: "SMB", arr: 18000, healthScore: 64, renewalDate: daysFromNow(9) },
  { name: "Driftwood Hotels", owner: "Dee Patel", segment: "Enterprise", arr: 310000, healthScore: 71, renewalDate: daysFromNow(140) },
  { name: "Evergreen Clinics", owner: "Ana Ruiz", segment: "Mid-Market", arr: 120000, healthScore: 22, renewalDate: daysFromNow(45) },
  { name: "Foxglove Media", owner: "Ben Carter", segment: "SMB", arr: 24000, healthScore: 90, renewalDate: daysFromNow(33) },
  { name: "Granite Payroll", owner: "Chen Li", segment: "Mid-Market", arr: 88000, healthScore: 38, renewalDate: daysFromNow(80) },
  { name: "Harbor Logistics", owner: "Dee Patel", segment: "Enterprise", arr: 205000, healthScore: 57, renewalDate: daysFromNow(15) },
  { name: "Ironwood Legal", owner: "Ana Ruiz", segment: "SMB", arr: 31000, healthScore: 76, renewalDate: daysFromNow(200) },
];

// Accounts brought over from the old spreadsheet with the bulk import.
// Values arrive as strings, exactly as they come out of a CSV file.
export const IMPORTED_ROWS = [
  { name: "Brightline Dental", owner: "Chen Li", segment: "Mid-Market", arr: "54000", healthScore: "18", renewalDate: isoDay(27) },
  { name: "Kestrel Freight", owner: "Ben Carter", segment: "Mid-Market", arr: "61000", healthScore: "31", renewalDate: isoDay(52) },
  { name: "Lumen Retail", owner: "Dee Patel", segment: "SMB", arr: "38000", healthScore: "66", renewalDate: isoDay(12) },
  { name: "Meridian Insurance", owner: "Ana Ruiz", segment: "Enterprise", arr: "72000", healthScore: "48", renewalDate: isoDay(88) },
  { name: "Northstar Fitness", owner: "Chen Li", segment: "SMB", arr: "27500", healthScore: "83", renewalDate: isoDay(160) },
];

const TASKS = {
  "Acme Robotics": [
    { title: "Quarterly business review", due: 10, done: false },
    { title: "Share product roadmap", due: -5, done: true },
  ],
  "Bluefin Analytics": [
    { title: "Call champion about usage drop", due: 2, done: false },
    { title: "Send renewal quote", due: 7, done: false },
  ],
  "Cobalt Learning": [{ title: "Confirm renewal with finance", due: 3, done: false }],
  "Evergreen Clinics": [
    { title: "Exec sponsor check-in", due: 4, done: false },
    { title: "Fix onboarding gaps for new clinic", due: -2, done: false },
  ],
  "Granite Payroll": [{ title: "Training session for admins", due: 12, done: true }],
  "Brightline Dental": [{ title: "Intro call after migration", due: 6, done: false }],
  "Lumen Retail": [{ title: "Renewal pricing review", due: 5, done: false }],
};

export async function seedDatabase() {
  await Account.deleteMany({});
  await Task.deleteMany({});

  await Account.create(MANUAL_ACCOUNTS);
  await importAccounts(IMPORTED_ROWS);

  const accounts = await Account.find({}, { name: 1 });
  const idByName = Object.fromEntries(accounts.map((a) => [a.name, a._id]));

  const tasks = Object.entries(TASKS).flatMap(([name, list]) =>
    list.map((t) => ({
      accountId: idByName[name],
      title: t.title,
      dueDate: daysFromNow(t.due),
      done: t.done,
      completedAt: t.done ? daysFromNow(-1) : null,
    })),
  );
  await Task.create(tasks);
}
