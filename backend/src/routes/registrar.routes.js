import express from "express";
import { loginRegistrar } from "../controllers/staffAuth.controller.js";
import authRole from "../middleware/authRole.js";
import {
  transferStudent,
  graduateStudent,
  getStudentIdCard,
  getStudentTranscript,
  getEnrollmentCertificate,
} from "../controllers/registrar.controller.js";

const router = express.Router();

const registrarOrAdmin = authRole("ADMIN", "REGISTRAR");

// Auth
router.post("/login", loginRegistrar);

// Student record management
router.post("/students/:id/transfer", registrarOrAdmin, transferStudent);
router.post("/students/:id/graduate", registrarOrAdmin, graduateStudent);

// Print / certificate endpoints
router.get("/students/:id/id-card", registrarOrAdmin, getStudentIdCard);
router.get("/students/:id/transcript", registrarOrAdmin, getStudentTranscript);
router.get("/students/:id/enrollment-certificate", registrarOrAdmin, getEnrollmentCertificate);

export default router;
