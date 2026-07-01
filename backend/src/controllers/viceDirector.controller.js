import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Class from "../models/Class.js";
import TeachingAssignment from "../models/TeachingAssignment.js";
import AcademicYear from "../models/AcademicYear.js";

// GET /api/vice-director/attendance-summary  — daily attendance overview
export const getAttendanceSummary = async (req, res) => {
  try {
    const { date, classId } = req.query;
    const query = {};
    if (date) query.date = new Date(date);
    if (classId) query.classId = classId;

    const records = await Attendance.find(query)
      .populate("classId", "name grade stream")
      .populate("studentId", "firstName lastName");

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === "PRESENT").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      late: records.filter((r) => r.status === "LATE").length,
      excused: records.filter((r) => r.status === "EXCUSED").length,
    };

    return res.status(200).json({ success: true, summary, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vice-director/teacher-workloads  — teacher assignment counts
export const getTeacherWorkloads = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const workloads = await TeachingAssignment.aggregate([
      { $match: { academicYearId: activeYear._id, isActive: true } },
      { $group: { _id: "$teacherId", classCount: { $sum: 1 } } },
      {
        $lookup: {
          from: "teachers",
          localField: "_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $project: {
          _id: 0,
          teacherId: "$_id",
          firstName: "$teacher.firstName",
          lastName: "$teacher.lastName",
          employeeId: "$teacher.employeeId",
          classCount: 1,
        },
      },
      { $sort: { classCount: -1 } },
    ]);

    return res.status(200).json({ success: true, count: workloads.length, workloads });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vice-director/classes  — all classes with student counts
export const getClassesOverview = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const classes = await Class.find({ academicYearId: activeYear._id })
      .populate("classBossId", "firstName lastName")
      .sort({ grade: 1, name: 1 });

    const classData = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await Student.countDocuments({
          currentClassId: c._id,
          status: "APPROVED",
        });
        return { ...c.toObject(), studentCount };
      })
    );

    return res.status(200).json({ success: true, count: classData.length, classes: classData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
