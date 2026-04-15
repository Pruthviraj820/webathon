import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express()


app.use(cors());

app.use(express.json())

const start = async ()=>{
    const connectDB = await mongoose.connect(process.env.MONGO_URI);

    app.listen(9080 , ()=>{
        console.log("Server is running on port 9090");

    })
}

start();