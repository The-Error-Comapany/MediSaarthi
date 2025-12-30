//database connection
import mongoose from "mongoose";
import {DB_NAME} from "../db/constant.js";

import express from "express";
const app = express();

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`); //for connection
        console.log(`MongoDB conected! DB HOST: ${connectionInstance.connection.host}`);
    }
    catch(error){
      console.log("ERROR: MONGO DB conncetion failed : ",error);
      process.exit(1);
    }
}

export default connectDB;