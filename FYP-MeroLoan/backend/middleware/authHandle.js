import createError from "http-errors";
import { User } from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    console.log("User ID from token:", req.userId);

    const user = await User.findById(req.userId);
    if (!user) {
      return next(createError(404, "User not found."));
    }
    if (user.role !== "admin") {
      return next(createError(403, "You are not admin."));
    }

    next();
  } catch (err) {
    console.error("Error in isAdmin middleware:", err);
    next(createError(500, "Server Error"));
  }
};
