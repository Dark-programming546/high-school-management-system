import express from "express";
import authRole from "../middleware/authRole.js";
import {
  createStudent,
  getStudents,
  updateStudentStatus,
} from "../controllers/student.controller.js";

const router = express.Router();

// REGISTRAR and ADMIN can register and view students
router.post("/", authRole("ADMIN", "REGISTRAR"), createStudent);
router.get("/", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"), getStudents);

// Only ADMIN can approve/reject
router.patch("/:id/status", authRole("ADMIN"), updateStudentStatus);

export default router;
