import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Check backend/.env");
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME ?? "modiq",
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error", error);
    process.exit(1);
  }
}
