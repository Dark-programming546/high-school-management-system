import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import authUser from "../middleware/authUser.js";
import {
  calculateResult,
  getResults,
} from "../controllers/result.controller.js";

const router = express.Router();

// Admin only: calculate results
router.post("/calculate", authAdmin, calculateResult);

// Admin or Teacher: view results
router.get("/", authUser, getResults);

export default router;
