import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connect = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';
    await mongoose.connect(mongoUri);
    console.log("connected to mongodb");
  } catch (error) {
    console.log("unable to connect to mongoDB: ", error.message);
  }
};

export default connect;
