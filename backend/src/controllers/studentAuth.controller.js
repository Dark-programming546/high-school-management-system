import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import { generateUniquePassword } from "../utils/passwordGenerator.js";

// PATCH /api/student-auth/students/:id/account  — admin or registrar
export const createStudentAccount = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string" || !username.trim())
      return res.status(400).json({ success: false, message: "Username is required" });

    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const taken = await Student.findOne({
      username: username.toLowerCase(),
      _id: { $ne: student._id },
    });
    if (taken)
      return res.status(409).json({ success: false, message: "Username already taken" });

    const plainPassword = await generateUniquePassword(username);

    student.username = username.toLowerCase().trim();
    student.password = await bcrypt.hash(plainPassword, 10);
    student.mustChangePassword = true;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student account created successfully",
      student: {
        id: student._id,
        username: student.username,
        temporaryPassword: plainPassword,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/student-auth/login  — public
export const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const student = await Student.findOne({ username: username.toLowerCase() }).select("+password");

    if (!student || !student.password)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    student.lastLogin = new Date();
    await student.save();

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        username: student.username,
        currentGrade: student.currentGrade,
        mustChangePassword: student.mustChangePassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/student-auth/change-password  — student JWT required
export const changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const student = await Student.findById(req.user.id).select("+password");
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Current password is incorrect" });

    student.password = await bcrypt.hash(newPassword, 10);
    student.mustChangePassword = false;
    await student.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
