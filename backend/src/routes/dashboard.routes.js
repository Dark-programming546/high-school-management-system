import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(authAdmin);

router.get("/stats", getDashboardStats);

export default router;
