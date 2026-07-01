import express from "express";
import authUser from "../middleware/authUser.js";
import {
  getMyClasses,
  getClassStudents,
  getMyMarks,
  getTeacherProfile,
} from "../controllers/teacherDashboard.controller.js";

const router = express.Router();

router.get("/profile", authUser, getTeacherProfile);
router.get("/my-classes", authUser, getMyClasses);
router.get("/my-classes/:classId/students", authUser, getClassStudents);
router.get("/my-marks/:classId/:subjectId", authUser, getMyMarks);

export default router;
