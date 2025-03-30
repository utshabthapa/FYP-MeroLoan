import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connectDB.js";
import http from "http"; // Import the http module
import { Server } from "socket.io"; // Import socket.io

import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import kycRoutes from "./routes/kyc.route.js";
import loanRoutes from "./routes/loan.route.js";
import paymentRoutes from "./routes/payment.route.js";
import activeContractRoutes from "./routes/activeContract.route.js";
import userDashboardRoutes from "./routes/userDashboard.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import notificationRoutes from "./routes/notification.route.js";
import userProfileRoutes from "./routes/userProfile.route.js";
import appealRoutes from "./routes/appeal.route.js";

import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // Get the file path
const __dirname = path.dirname(__filename); // Get the directory name
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a user-specific room
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId); // Join a room named after the user ID
    console.log(`User ${userId} joined their room`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/active-contracts", activeContractRoutes);
app.use("/api/userDashboard", userDashboardRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/users", userProfileRoutes);
app.use("/api/appeals", appealRoutes);

// Start the server
server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});

// Export `io` for use in other files (e.g., to emit notifications)
export { io };
