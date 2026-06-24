import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import authUser from "../middleware/authUser.js";
import {
  createTeacherAccount,
  loginTeacher,
  changeTeacherPassword,
} from "../controllers/teacherAuth.controller.js";

const router = express.Router();

// Admin creates a teacher login account
router.patch("/teachers/:id/account", authAdmin, createTeacherAccount);

// Teacher logs in
router.post("/login", loginTeacher);

// Teacher changes their own password
router.patch("/change-password", authUser, changeTeacherPassword);

export default router;
