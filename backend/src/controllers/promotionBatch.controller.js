import Student from "../models/Student.js";
import AcademicYear from "../models/AcademicYear.js";
import { promoteAllStudents } from "../services/promotionBatch.service.js";
import { enrollStudentSubjects } from "../services/enrollment.service.js";

// POST /api/promotion-batch/run
// Body (optional): { grade } — promote only a specific grade, or all if omitted
export const runPromotion = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const { grade } = req.body;
    const query = { academicYearId: activeYear._id, status: "APPROVED" };
    if (grade) query.currentGrade = Number(grade);

    const students = await Student.find(query);

    if (!students.length)
      return res.status(200).json({ success: true, message: "No eligible students found", result: [] });

    const result = await promoteAllStudents(students);

    // Re-enroll promoted students in their new grade's subjects
    const promoted = result.filter((r) => r.status === "PROMOTED");
    for (const r of promoted) {
      const student = await Student.findById(r.studentId);
      if (student) await enrollStudentSubjects(student, activeYear._id);
    }

    return res.status(200).json({
      success: true,
      message: "Batch promotion completed",
      academicYear: activeYear.name,
      total: result.length,
      promoted: promoted.length,
      graduated: result.filter((r) => r.status === "GRADUATED").length,
      repeated: result.filter((r) => r.status === "REPEAT").length,
      skipped: result.filter((r) => r.status === "SKIPPED").length,
      result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
