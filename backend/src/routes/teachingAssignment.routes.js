import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import authUser from "../middleware/authUser.js";
import {
  createTeachingAssignment,
  getTeachingAssignments,
  deleteTeachingAssignment,
} from "../controllers/teachingAssignment.controller.js";

const router = express.Router();

// Admin: create and delete assignments
router.post("/", authAdmin, createTeachingAssignment);
router.delete("/:id", authAdmin, deleteTeachingAssignment);

// Admin or Teacher: read assignments
router.get("/", authUser, getTeachingAssignments);

export default router;
