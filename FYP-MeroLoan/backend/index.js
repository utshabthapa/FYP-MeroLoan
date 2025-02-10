import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import kycRoutes from "./routes/kyc.route.js";
import loanRoutes from "./routes/loan.route.js";
import paymentRoutes from "./routes/payment.route.js";
import activeContractRoutes from "./routes/activeContract.route.js";

import cookieParser from "cookie-parser";
import path from "path";

import cors from "cors";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // Get the file path
const __dirname = path.dirname(__filename); // Get the directory name
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
// const userRoutes = require("./userRoutes");
// app.use("/api", userRoutes);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/active-contracts", activeContractRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server running on port 5000");
});
