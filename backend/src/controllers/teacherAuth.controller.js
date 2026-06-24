import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Teacher from "../models/Teacher.js";

// PATCH /api/teachers/:id/account
export const createTeacherAccount = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const existingUsername = await Teacher.findOne({
      username: username.toLowerCase(),
      _id: { $ne: teacher._id },
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    teacher.username = username.toLowerCase();
    teacher.password = await bcrypt.hash(password, 10);
    teacher.mustChangePassword = true;
    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Teacher account created successfully",
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        username: teacher.username,
        role: teacher.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/teacher-auth/login
export const loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const teacher = await Teacher.findOne({
      username: username.toLowerCase(),
      isActive: true,
    }).select("+password");

    if (!teacher || !teacher.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    teacher.lastLogin = new Date();
    await teacher.save();

    const token = jwt.sign(
      {
        id: teacher._id,
        role: teacher.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      token,
      teacher: {
        id: teacher._id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        username: teacher.username,
        role: teacher.role,
        mustChangePassword: teacher.mustChangePassword,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/teacher-auth/change-password  — teacher JWT required
export const changeTeacherPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const teacher = await Teacher.findById(req.user.id).select("+password");
    if (!teacher)
      return res.status(404).json({ success: false, message: "Teacher not found" });

    const isMatch = await bcrypt.compare(currentPassword, teacher.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Current password is incorrect" });

    teacher.password = await bcrypt.hash(newPassword, 10);
    teacher.mustChangePassword = false;
    await teacher.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
