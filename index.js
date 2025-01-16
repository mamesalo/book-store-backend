import express from "express";
import { MONGODB_URL, PORT } from "./config.js";
import mongoose from "mongoose";
import cors from "cors";
import bookRouter from "./routes/bookRoutes.js";
import userRouter from "./routes/userRoute.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use("/book", bookRouter);
app.use("/user", userRouter);

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("✅ connected to mongo DB");
    app.listen(PORT, () => {
      console.log(`✅ server start running ✈️  in port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`mongoDb connection error : ${error} `);
  });
