import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Class from "../models/Class.js";
import Result from "../models/Result.js";
import Mark from "../models/Mark.js";
import AcademicYear from "../models/AcademicYear.js";
import TeachingAssignment from "../models/TeachingAssignment.js";

// GET /api/director/stats  — school-wide statistics
export const getSchoolStats = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });

    const [totalStudents, totalTeachers, totalClasses, pendingStudents] = await Promise.all([
      Student.countDocuments({ status: "APPROVED" }),
      Teacher.countDocuments({ isActive: true }),
      Class.countDocuments(activeYear ? { academicYearId: activeYear._id } : {}),
      Student.countDocuments({ status: "PENDING" }),
    ]);

    const gradeBreakdown = await Student.aggregate([
      { $match: { status: "APPROVED" } },
      { $group: { _id: "$currentGrade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const streamBreakdown = await Student.aggregate([
      { $match: { status: "APPROVED", currentGrade: { $in: [11, 12] } } },
      { $group: { _id: { grade: "$currentGrade", stream: "$stream" }, count: { $sum: 1 } } },
      { $sort: { "_id.grade": 1 } },
    ]);

    let passRate = 0;
    let failRate = 0;
    if (activeYear) {
      const total = await Result.countDocuments({ academicYearId: activeYear._id });
      const passed = await Result.countDocuments({ academicYearId: activeYear._id, status: "PASS" });
      if (total > 0) {
        passRate = Number(((passed / total) * 100).toFixed(2));
        failRate = Number((((total - passed) / total) * 100).toFixed(2));
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingStudents,
        passRate,
        failRate,
        gradeBreakdown,
        streamBreakdown,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/director/results  — grade/stream results overview
export const getResultsOverview = async (req, res) => {
  try {
    const { grade, stream } = req.query;
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const studentQuery = { status: "APPROVED", academicYearId: activeYear._id };
    if (grade) studentQuery.currentGrade = Number(grade);
    if (stream) studentQuery.stream = stream;

    const students = await Student.find(studentQuery).select("_id");
    const studentIds = students.map((s) => s._id);

    const results = await Result.find({
      studentId: { $in: studentIds },
      academicYearId: activeYear._id,
    })
      .populate("studentId", "firstName lastName currentGrade stream section")
      .populate("classId", "name grade stream")
      .sort({ averageScore: -1 });

    return res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/director/teachers  — teacher list with workload
export const getTeachersOverview = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });

    const teachers = await Teacher.find({ isActive: true })
      .select("-password")
      .sort({ firstName: 1 });

    const teacherData = await Promise.all(
      teachers.map(async (t) => {
        const assignmentCount = activeYear
          ? await TeachingAssignment.countDocuments({
              teacherId: t._id,
              academicYearId: activeYear._id,
              isActive: true,
            })
          : 0;
        return { ...t.toObject(), assignedClasses: assignmentCount };
      })
    );

    return res.status(200).json({ success: true, count: teacherData.length, teachers: teacherData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
