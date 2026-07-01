import express from "express";
import authUser from "../middleware/authUser.js";
import {
  getMyProfile,
  getMySubjects,
  getMyMarks,
  getMyAttendance,
  getMyReportCard,
} from "../controllers/studentDashboard.controller.js";

const router = express.Router();

router.get("/profile", authUser, getMyProfile);
router.get("/subjects", authUser, getMySubjects);
router.get("/marks", authUser, getMyMarks);
router.get("/attendance", authUser, getMyAttendance);
router.get("/report-card", authUser, getMyReportCard);

export default router;
