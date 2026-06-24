import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import authUser from "../middleware/authUser.js";
import {
  createOrUpdateMark,
  getStudentMarks,
} from "../controllers/mark.controller.js";

const router = express.Router();

// Teacher submits marks (authUser so req.user.id is the teacherId)
router.post("/", authUser, createOrUpdateMark);

// Admin or Teacher: read marks for a student
router.get("/student/:id", authUser, getStudentMarks);

export default router;
