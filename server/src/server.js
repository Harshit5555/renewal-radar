import { createApp } from "./app.js";
import { connectDb } from "./db.js";
import { Account } from "./models/Account.js";
import { seedDatabase } from "./seed/seed.js";

const port = Number(process.env.PORT ?? 4100);

await connectDb();
if ((await Account.estimatedDocumentCount()) === 0) {
  await seedDatabase();
  console.log("Seeded sample accounts and tasks.");
}

createApp().listen(port, () => {
  console.log(`Renewal Radar API listening on http://localhost:${port}`);
});
