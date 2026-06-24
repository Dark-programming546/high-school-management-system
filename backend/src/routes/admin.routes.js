import express from "express";
import { loginAdmin, createStaffAccount, getStaffAccounts, deleteStaffAccount, resetStaffPassword } from "../controllers/admin.controller.js";
import authRole from "../middleware/authRole.js";

const router = express.Router();
const adminOnly = authRole("ADMIN");

// Public
router.post("/login", loginAdmin);

// Profile
router.get("/profile", adminOnly, (req, res) => res.json({ success: true, admin: req.admin }));

// Staff account management (ADMIN only)
router.post("/staff",                    adminOnly, createStaffAccount);
router.get("/staff",                     adminOnly, getStaffAccounts);
router.delete("/staff/:id",              adminOnly, deleteStaffAccount);
router.patch("/staff/:id/reset-password", adminOnly, resetStaffPassword);

export default router;
