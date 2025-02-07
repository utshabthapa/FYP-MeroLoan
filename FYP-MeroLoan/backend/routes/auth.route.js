import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  updateProfilePicture,
  updateProfile,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/update-profile-picture/:id", verifyToken, updateProfilePicture);
router.put("/update-profile/:id", verifyToken, updateProfile);

export default router;
