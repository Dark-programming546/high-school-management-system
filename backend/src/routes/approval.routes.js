import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import {
  approveMark,
  publishResults,
} from "../controllers/approval.controller.js";

const router = express.Router();

router.use(authAdmin);

// admin approves single mark
router.patch("/mark/:id", approveMark);

// admin publishes whole class results
router.patch("/publish/:classId/:semester", publishResults);

export default router;
