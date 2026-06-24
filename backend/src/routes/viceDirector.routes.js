import express from "express";
import { loginViceDirector } from "../controllers/staffAuth.controller.js";

const router = express.Router();

// POST /api/vice-director/login
router.post("/login", loginViceDirector);

export default router;
