import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import authUser from "../middleware/authUser.js";
import {
  createStudentAccount,
  loginStudent,
  changeStudentPassword,
} from "../controllers/studentAuth.controller.js";

const router = express.Router();

// Admin creates a student login account
router.patch("/students/:id/account", authAdmin, createStudentAccount);

// Student logs in
router.post("/login", loginStudent);

// Student changes their own password
router.patch("/change-password", authUser, changeStudentPassword);

export default router;
