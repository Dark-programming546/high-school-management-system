import express from "express";
import authRole from "../middleware/authRole.js";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

const router = express.Router();

const canRead  = authRole("ADMIN", "DIRECTOR", "VICE_DIRECTOR");
const adminOnly = authRole("ADMIN");

router.post("/",     adminOnly, createTeacher);
router.get("/",      canRead,   getTeachers);
router.get("/:id",   canRead,   getTeacherById);
router.patch("/:id", adminOnly, updateTeacher);
router.delete("/:id",adminOnly, deleteTeacher);

export default router;
