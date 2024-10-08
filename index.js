import express from "express";
// import dotenv from "dotenv";
import loadEnv from "./util/envConfig.js";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

// importing the routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const PORT = 3000;

app.use(cors());

// loading the content in .env file to the process.env object
loadEnv();

// middleware to parse the request body
app.use(bodyParser.json());

// middleware for all the routes starting with /auth
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes)

app.listen(PORT, async () => {
  const connectToDb = await mongoose.connect(process.env.DB_URI, {
    dbName: "dailySync",
  });
  console.log("Connected to the database");
  console.log(`Server is running on PORT ${PORT}`);
});
