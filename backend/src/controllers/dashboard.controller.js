import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Class from "../models/Class.js";
import Result from "../models/Result.js";
import Mark from "../models/Mark.js";
import AcademicYear from "../models/AcademicYear.js";

// GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingApplications,
      publishedResults,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments(),
      Student.countDocuments({ currentGrade: 9, status: "PENDING" }),
      Mark.countDocuments({ status: "PUBLISHED" }),
    ]);

    let totalResults = 0;
    let passedStudents = 0;
    let failedOrRepeatStudents = 0;
    let topStudents = [];

    if (activeYear) {
      const [
        resultsCount,
        passCount,
        failRepeatCount,
        topResultDocs,
      ] = await Promise.all([
        Result.countDocuments({ academicYearId: activeYear._id }),
        Result.countDocuments({
          academicYearId: activeYear._id,
          status: "PASS",
        }),
        Result.countDocuments({
          academicYearId: activeYear._id,
          status: { $in: ["FAIL", "REPEAT"] },
        }),
        Result.find({ academicYearId: activeYear._id })
          .sort({ schoolRank: 1, averageScore: -1 })
          .limit(3)
          .populate("studentId", "firstName lastName currentGrade stream")
          .select("averageScore schoolRank studentId")
          .lean(),
      ]);

      totalResults = resultsCount;
      passedStudents = passCount;
      failedOrRepeatStudents = failRepeatCount;
      topStudents = topResultDocs.map((doc) => ({
        student: doc.studentId,
        averageScore: doc.averageScore,
        schoolRank: doc.schoolRank,
      }));
    }

    const passRate =
      totalResults === 0
        ? 0
        : Number(((passedStudents / totalResults) * 100).toFixed(2));

    const failRate =
      totalResults === 0
        ? 0
        : Number(((failedOrRepeatStudents / totalResults) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingApplications,
        publishedResults,
        totalResults,
        passedStudents,
        failedOrRepeatStudents,
        passRate,
        failRate,
        topStudents,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
