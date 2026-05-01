import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; //frontend and backend connected
import authRoutes from "./routes/authRoutes.js";

dotenv.config();//use env file

const app =express();//express app inialization

app.use(express.json());

app.use("/api/auth", authRoutes);

const port =dotenv.PORT;


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});