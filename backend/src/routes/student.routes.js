import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  createStudent,
  getStudents,
  updateStudentStatus,
} from "../controllers/student.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/", createStudent);
router.get("/", getStudents);
router.patch("/:id/status", updateStudentStatus);

export default router;
