import mongoose from "mongoose";
import Student from "../models/Student.js";
import AcademicYear from "../models/AcademicYear.js";

const validStatuses = ["PENDING", "APPROVED", "REJECTED"];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

// POST /api/students
export const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phone,
      currentGrade,
      stream,
    } = req.body;

    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      return res.status(400).json({ success: false, message: "First name is required" });
    }

    if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
      return res.status(400).json({ success: false, message: "Last name is required" });
    }

    if (currentGrade === undefined || ![9, 10, 11, 12].includes(Number(currentGrade))) {
      return res.status(400).json({ success: false, message: "Grade must be 9, 10, 11, or 12" });
    }

    const activeYear = await AcademicYear.findOne({ isActive: true });

    if (!activeYear) {
      return res.status(400).json({
        success: false,
        message: "No active academic year found",
      });
    }

    const student = await Student.create({
      firstName: normalizeString(firstName),
      lastName: normalizeString(lastName),
      gender,
      dateOfBirth,
      phone: normalizeString(phone),
      currentGrade,
      stream,
      academicYearId: activeYear._id,
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/students
export const getStudents = async (req, res) => {
  try {
    const {
      search = "",
      grade,
      stream,
      registrationStatus,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { registrationNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (grade) {
      query.currentGrade = Number(grade);
    }

    if (stream) {
      query.stream = stream;
    }

    if (registrationStatus) {
      query.registrationStatus = registrationStatus;
    }

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
      message: "Students fetched successfully",
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/students/:id/status
export const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: PENDING, APPROVED, REJECTED",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.status = status;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student status updated",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
