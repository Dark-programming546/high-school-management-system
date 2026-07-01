import AcademicYear from "../models/AcademicYear.js";
import Student from "../models/Student.js";
import { enrollStudentSubjects, getStudentSubjects } from "../services/enrollment.service.js";

// POST /api/enrollment/:studentId  — manually trigger enrollment (admin/registrar)
export const enrollStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    if (student.status !== "APPROVED")
      return res.status(400).json({ success: false, message: "Student must be approved before enrollment" });

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const count = await enrollStudentSubjects(student, activeYear._id);

    return res.status(200).json({
      success: true,
      message: `Student enrolled in ${count} subject(s)`,
      enrolledCount: count,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/enrollment/:studentId  — get enrolled subjects for a student
export const getEnrolledSubjects = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const subjects = await getStudentSubjects(req.params.studentId, activeYear._id);

    return res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
