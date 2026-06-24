import express from "express";
import authRole from "../middleware/authRole.js";
import authUser from "../middleware/authUser.js";
import {
  createStudentAccount,
  loginStudent,
  changeStudentPassword,
} from "../controllers/studentAuth.controller.js";

const router = express.Router();

// Admin or Registrar creates a student login account (password auto-generated)
router.patch("/students/:id/account", authRole("ADMIN", "REGISTRAR"), createStudentAccount);

// Student logs in
router.post("/login", loginStudent);

// Student changes their own password
router.patch("/change-password", authUser, changeStudentPassword);

export default router;
