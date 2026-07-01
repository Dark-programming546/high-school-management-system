import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import AcademicYear from "../models/AcademicYear.js";
import { generateUsername } from "../utils/usernameGenerator.js";
import { generateUniquePassword } from "../utils/passwordGenerator.js";
import { enrollStudentSubjects } from "../services/enrollment.service.js";

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

/**
 * Assign student to the least-populated class for their grade (and stream if 11/12).
 */
const autoAssignClass = async (student, academicYearId) => {
  const query = { grade: student.currentGrade, academicYearId };
  if (student.currentGrade >= 11 && student.stream !== "NONE") {
    query.stream = student.stream;
  }

  // Find all classes for this grade, pick the one with fewest students
  const classes = await Class.find(query).sort({ name: 1 });
  if (!classes.length) return { classId: null, section: null };

  let bestClass = classes[0];
  let minCount = await Student.countDocuments({ currentClassId: bestClass._id });

  for (let i = 1; i < classes.length; i++) {
    const count = await Student.countDocuments({ currentClassId: classes[i]._id });
    if (count < minCount) {
      minCount = count;
      bestClass = classes[i];
    }
  }

  const sectionMatch = bestClass.name.match(/([A-Za-z]+)$/);
  const section = sectionMatch ? sectionMatch[1].toUpperCase() : null;
  return { classId: bestClass._id, section };
};

// POST /api/students
export const createStudent = async (req, res) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, phone, currentGrade, stream } = req.body;

    if (!firstName || typeof firstName !== "string" || !firstName.trim())
      return res.status(400).json({ success: false, message: "First name is required" });

    if (!lastName || typeof lastName !== "string" || !lastName.trim())
      return res.status(400).json({ success: false, message: "Last name is required" });

    if (currentGrade === undefined || ![9, 10, 11, 12].includes(Number(currentGrade)))
      return res.status(400).json({ success: false, message: "Grade must be 9, 10, 11, or 12" });

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year found" });

    const student = await Student.create({
      firstName: normalizeString(firstName),
      lastName: normalizeString(lastName),
      gender,
      dateOfBirth,
      phone: normalizeString(phone),
      currentGrade: Number(currentGrade),
      stream: stream || "NONE",
      academicYearId: activeYear._id,
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students
export const getStudents = async (req, res) => {
  try {
    const { search = "", grade, stream, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    if (grade) query.currentGrade = Number(grade);
    if (stream) query.stream = stream;
    if (status) query.status = status;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageLimit;

    const totalStudents = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalStudents,
        currentPage,
        pageLimit,
        totalPages: Math.ceil(totalStudents / pageLimit),
        hasNextPage: currentPage * pageLimit < totalStudents,
      },
      students,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/:id
export const getStudentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid student ID" });

    const student = await Student.findById(req.params.id)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    return res.status(200).json({ success: true, student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid student ID" });

    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const allowed = ["firstName", "lastName", "gender", "dateOfBirth", "phone"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) student[field] = req.body[field];
    });

    await student.save();
    return res.status(200).json({ success: true, message: "Student updated", student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/students/:id/status
export const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];

    if (!status || !validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid student ID" });

    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    student.status = status;

    // On approval: auto-generate credentials and assign class
    if (status === "APPROVED" && !student.username) {
      const enrollmentYear = new Date().getFullYear();
      const username = await generateUsername(student.firstName, student.lastName, enrollmentYear);
      const plainPassword = await generateUniquePassword(username);

      student.username = username;
      student.password = await bcrypt.hash(plainPassword, 10);
      student.mustChangePassword = true;

      const { classId, section } = await autoAssignClass(student, student.academicYearId);
      student.currentClassId = classId;
      student.section = section;

      await student.save();

      // Auto-enroll in fixed subjects for this grade/stream
      await enrollStudentSubjects(student, student.academicYearId);

      return res.status(200).json({
        success: true,
        message: "Student approved. Credentials generated, class assigned, and subjects enrolled.",
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          username: student.username,
          temporaryPassword: plainPassword,
          currentGrade: student.currentGrade,
          section: student.section,
          currentClassId: student.currentClassId,
          mustChangePassword: true,
        },
      });
    }

    await student.save();
    return res.status(200).json({ success: true, message: "Student status updated", student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
