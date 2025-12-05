import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DBNAME,
    });
    console.log("MongoDB connected");
    console.log("DBName: " + process.env.MONGO_DBNAME);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
