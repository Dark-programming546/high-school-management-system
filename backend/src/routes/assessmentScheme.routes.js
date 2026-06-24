import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  createScheme,
  getSchemes,
  updateScheme,
} from "../controllers/assessmentScheme.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/", createScheme);
router.get("/", getSchemes);
router.patch("/:id", updateScheme);

export default router;
