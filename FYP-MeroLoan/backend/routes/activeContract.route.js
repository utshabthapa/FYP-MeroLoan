import express from "express";
import {
  createActiveContract,
  getUserActiveContracts,
  updateActiveContract,
} from "../controllers/activeContract.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createActiveContract);
router.get("/user/:userId", verifyToken, getUserActiveContracts);
router.patch("/:contractId", verifyToken, updateActiveContract);

export default router;
