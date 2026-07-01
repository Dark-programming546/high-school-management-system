import Student from "../models/Student.js";
import Mark from "../models/Mark.js";
import Attendance from "../models/Attendance.js";
import Result from "../models/Result.js";
import AcademicYear from "../models/AcademicYear.js";
import { getStudentSubjects } from "../services/enrollment.service.js";

// GET /api/student/profile
export const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name")
      .select("-password");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    return res.status(200).json({ success: true, student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/student/subjects  — enrolled subjects for active year
export const getMySubjects = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const subjects = await getStudentSubjects(req.user.id, activeYear._id);
    return res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/student/marks  — all marks for the student
export const getMyMarks = async (req, res) => {
  try {
    const { semester } = req.query;
    const query = { studentId: req.user.id };
    if (semester) query.semester = Number(semester);

    const marks = await Mark.find(query)
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName")
      .sort({ semester: 1, "subjectId.name": 1 });

    return res.status(200).json({ success: true, count: marks.length, marks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/student/attendance  — attendance summary and records
export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id })
      .populate("classId", "name grade")
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;
    const attendanceRate = total === 0 ? 0 : Number(((present / total) * 100).toFixed(1));

    return res.status(200).json({
      success: true,
      summary: { total, present, absent, late, excused, attendanceRate },
      records,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/student/report-card  — result + marks for report card
export const getMyReportCard = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const student = await Student.findById(req.user.id)
      .populate("currentClassId", "name grade stream")
      .select("-password");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const [marks, result] = await Promise.all([
      Mark.find({ studentId: req.user.id, academicYearId: activeYear._id, status: "PUBLISHED" })
        .populate("subjectId", "name code")
        .sort({ semester: 1, "subjectId.name": 1 }),
      Result.findOne({ studentId: req.user.id, academicYearId: activeYear._id }),
    ]);

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        username: student.username,
        currentGrade: student.currentGrade,
        stream: student.stream,
        section: student.section,
        class: student.currentClassId,
      },
      academicYear: activeYear.name,
      marks,
      result: result || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
