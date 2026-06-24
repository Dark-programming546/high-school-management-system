import express from "express";

import { loginAdmin } from "../controllers/admin.controller.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();

// Public route
router.post("/login", loginAdmin);

// Protected route
router.get("/profile", authAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

export default router;
