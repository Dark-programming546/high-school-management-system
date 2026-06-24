import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const JWT_SECRET    = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_ISSUER    = process.env.JWT_ISSUER || "high-school-management";

/**
 * Shared login handler for REGISTRAR, DIRECTOR, VICE_DIRECTOR.
 * @param {string} requiredRole  - The role this endpoint is for
 */
const loginStaff = (requiredRole) => async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || typeof username !== "string" || !username.trim())
      return res.status(400).json({ success: false, message: "Username is required" });

    if (!password || typeof password !== "string" || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const staff = await Admin.findOne({ username: username.trim(), role: requiredRole });

    if (!staff)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER }
    );

    staff.lastLogin = new Date();
    await staff.save();

    return res.json({
      success: true,
      token,
      staff: {
        id: staff._id,
        username: staff.username,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginRegistrar    = loginStaff("REGISTRAR");
export const loginDirector     = loginStaff("DIRECTOR");
export const loginViceDirector = loginStaff("VICE_DIRECTOR");
