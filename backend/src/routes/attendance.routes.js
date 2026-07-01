import express from "express";
import authRole from "../middleware/authRole.js";
import authUser from "../middleware/authUser.js";
import {
  takeAttendance,
  submitAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceReport,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Teacher: take and submit attendance
router.post("/", authUser, takeAttendance);
router.patch("/submit", authUser, submitAttendance);

// Teacher / Registrar / Admin: view class attendance
router.get("/class/:classId", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR", "TEACHER"), getClassAttendance);

// Student / Registrar / Admin: view student attendance
router.get("/student/:studentId", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"), getStudentAttendance);

// Admin / Director / Vice Director: attendance report
router.get("/report", authRole("ADMIN", "DIRECTOR", "VICE_DIRECTOR"), getAttendanceReport);

export default router;
