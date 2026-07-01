import express from "express";
import authRole from "../middleware/authRole.js";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
} from "../controllers/student.controller.js";

const router = express.Router();

router.post("/", authRole("ADMIN", "REGISTRAR"), createStudent);
router.get("/", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"), getStudents);
router.get("/:id", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"), getStudentById);
router.patch("/:id", authRole("ADMIN", "REGISTRAR"), updateStudent);
router.patch("/:id/status", authRole("ADMIN", "REGISTRAR"), updateStudentStatus);

export default router;
