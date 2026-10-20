import mongoose from "mongoose";

let memoryServer = null;

/**
 * Connects to MongoDB. Uses MONGO_URL if it is set (a local mongod or
 * Docker container). Otherwise starts a throwaway in-memory MongoDB so the
 * app runs with zero setup. In-memory data resets on every restart.
 */
export async function connectDb() {
  let uri = process.env.MONGO_URL;
  if (!uri) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("renewal-radar");
    console.log("No MONGO_URL set: using an in-memory MongoDB (data resets on restart).");
  }
  await mongoose.connect(uri);
  return uri;
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
