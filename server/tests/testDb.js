import mongoose from "mongoose";

let memoryServer = null;

/** Connects to a fresh test database (MONGO_URL if set, otherwise in-memory). */
export async function startTestDb() {
  if (process.env.MONGO_URL) {
    const dbName = `rr_test_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    await mongoose.connect(process.env.MONGO_URL, { dbName });
    return;
  }
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
}

export async function clearTestDb() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export async function stopTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
