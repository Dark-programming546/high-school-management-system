import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  createAcademicYear,
  getAcademicYears,
  activateAcademicYear,
} from "../controllers/academicYear.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/", createAcademicYear);
router.get("/", getAcademicYears);
router.patch("/:id/activate", activateAcademicYear);

export default router;
