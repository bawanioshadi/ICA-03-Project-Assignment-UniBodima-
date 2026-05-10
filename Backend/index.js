import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; //frontend and backend connected
import authRoutes from "./routes/authRoutes.js";
import boardingRoutes from "./routes/boardingRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";  

dotenv.config();//use env file

const app =express();//express app inialization

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/boardings", boardingRoutes);
app.use("/api/requests", requestRoutes);


const port = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});