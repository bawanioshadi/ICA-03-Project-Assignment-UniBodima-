import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; //frontend and backend connected

dotenv.config();//use env file

const app =express();//express app inialization

const port =dotenv.PORT;


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});