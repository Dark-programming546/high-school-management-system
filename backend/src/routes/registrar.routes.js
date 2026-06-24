import express from "express";
import { loginRegistrar } from "../controllers/staffAuth.controller.js";

const router = express.Router();

// POST /api/registrar/login
router.post("/login", loginRegistrar);

export default router;
