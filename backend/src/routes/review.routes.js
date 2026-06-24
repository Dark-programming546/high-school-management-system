import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  getClassMarksForReview,
  reviewMark,
} from "../controllers/review.controller.js";

const router = express.Router();

router.use(authAdmin);

// class boss views marks
router.get("/class/:classId/:semester", getClassMarksForReview);

// class boss approves mark
router.patch("/:markId", reviewMark);

export default router;
