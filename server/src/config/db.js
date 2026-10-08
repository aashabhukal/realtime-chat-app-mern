// src/config/db.js
import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(`MongoDB error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;