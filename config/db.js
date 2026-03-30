import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MongoDB connection error: MONGO_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    if (
      error?.name === "MongooseServerSelectionError" ||
      error?.code === "ENOTFOUND" ||
      error?.code === "ETIMEOUT"
    ) {
      console.error(
        "MongoDB Atlas is unreachable from current network. Check IP whitelist, DB user credentials, and outbound access to Atlas hosts/port 27017.",
      );
    }
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
