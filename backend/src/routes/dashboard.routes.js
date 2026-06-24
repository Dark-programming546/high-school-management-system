import express from "express";
import authRole from "../middleware/authRole.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

// All staff roles can view the dashboard
router.get("/stats", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"), getDashboardStats);

export default router;
