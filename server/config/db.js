import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { configDotenv } from 'dotenv'

configDotenv()


const MONGO_URI = process.env.MONGO_URI;


const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
};
export default connectDB;


export const client = new MongoClient(MONGO_URI).db();
