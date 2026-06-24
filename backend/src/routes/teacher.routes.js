import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/", createTeacher);
router.get("/", getTeachers);
router.get("/:id", getTeacherById);
router.patch("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
