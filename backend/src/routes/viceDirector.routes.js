import express from "express";
import { loginViceDirector } from "../controllers/staffAuth.controller.js";
import authRole from "../middleware/authRole.js";
import {
  getAttendanceSummary,
  getTeacherWorkloads,
  getClassesOverview,
} from "../controllers/viceDirector.controller.js";

const router = express.Router();

const viceDirectorAccess = authRole("ADMIN", "VICE_DIRECTOR");

router.post("/login", loginViceDirector);
router.get("/attendance-summary", viceDirectorAccess, getAttendanceSummary);
router.get("/teacher-workloads", viceDirectorAccess, getTeacherWorkloads);
router.get("/classes", viceDirectorAccess, getClassesOverview);

export default router;
