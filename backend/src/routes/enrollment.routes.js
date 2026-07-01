import express from "express";
import authRole from "../middleware/authRole.js";
import { enrollStudent, getEnrolledSubjects } from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/:studentId", authRole("ADMIN", "REGISTRAR"), enrollStudent);
router.get("/:studentId", authRole("ADMIN", "REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"), getEnrolledSubjects);

export default router;
