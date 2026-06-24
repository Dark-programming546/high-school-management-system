import express from "express";
import { loginDirector } from "../controllers/staffAuth.controller.js";

const router = express.Router();

// POST /api/director/login
router.post("/login", loginDirector);

export default router;
