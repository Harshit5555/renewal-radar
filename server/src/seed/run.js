// Re-seeds the database at MONGO_URL. With no MONGO_URL the in-memory
// database is re-seeded automatically on every server start instead.
import { connectDb, disconnectDb } from "../db.js";
import { seedDatabase } from "./seed.js";

await connectDb();
await seedDatabase();
console.log("Database re-seeded.");
await disconnectDb();
