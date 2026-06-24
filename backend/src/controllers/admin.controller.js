import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import Admin from "../models/Admin.js";

dotenv.config();
const JWT_SECRET    = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_ISSUER    = process.env.JWT_ISSUER || "high-school-management";

const STAFF_ROLES = ["REGISTRAR", "DIRECTOR", "VICE_DIRECTOR"];

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || typeof username !== "string" || !username.trim())
      return res.status(400).json({ success: false, message: "Username is required" });

    if (!password || typeof password !== "string" || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const admin = await Admin.findOne({ username, role: "ADMIN" });

    if (!admin)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
    });

    admin.lastLogin = Date.now();
    await admin.save();

    return res.json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/admin/staff  — create REGISTRAR, DIRECTOR, or VICE_DIRECTOR account
export const createStaffAccount = async (req, res) => {
  try {
    const { username, password, role, firstName, lastName } = req.body;

    if (!username || typeof username !== "string" || !username.trim())
      return res.status(400).json({ success: false, message: "Username is required" });

    if (!password || typeof password !== "string" || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    if (!role || !STAFF_ROLES.includes(role))
      return res.status(400).json({ success: false, message: `Role must be one of: ${STAFF_ROLES.join(", ")}` });

    const existing = await Admin.findOne({ username: username.trim().toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);

    const staff = await Admin.create({
      username: username.trim().toLowerCase(),
      password: hashed,
      role,
      firstName: firstName?.trim() || "",
      lastName:  lastName?.trim()  || "",
    });

    return res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      staff: {
        id:        staff._id,
        username:  staff.username,
        role:      staff.role,
        firstName: staff.firstName,
        lastName:  staff.lastName,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/staff  — list all non-admin staff accounts
export const getStaffAccounts = async (req, res) => {
  try {
    const staff = await Admin.find({ role: { $in: STAFF_ROLES } })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ success: true, staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/staff/:id  — remove a staff account
export const deleteStaffAccount = async (req, res) => {
  try {
    const staff = await Admin.findOne({ _id: req.params.id, role: { $in: STAFF_ROLES } });

    if (!staff)
      return res.status(404).json({ success: false, message: "Staff account not found" });

    await staff.deleteOne();

    return res.json({ success: true, message: "Staff account deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/staff/:id/reset-password  — admin resets staff password
export const resetStaffPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const staff = await Admin.findOne({ _id: req.params.id, role: { $in: STAFF_ROLES } });
    if (!staff)
      return res.status(404).json({ success: false, message: "Staff account not found" });

    staff.password = await bcrypt.hash(password, 10);
    await staff.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
