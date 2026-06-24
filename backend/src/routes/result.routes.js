import express from "express";
import authRole from "../middleware/authRole.js";
import authUser from "../middleware/authUser.js";
import {
  calculateResult,
  getResults,
} from "../controllers/result.controller.js";

const router = express.Router();

// Admin only: calculate results
router.post("/calculate", authRole("ADMIN"), calculateResult);

// Admin, Director, Vice Director, Teacher: view results
router.get("/", authUser, getResults);

export default router;
