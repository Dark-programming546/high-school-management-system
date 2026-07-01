import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import AcademicYear from "../models/AcademicYear.js";

const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

// POST /api/attendance  — teacher takes attendance for a class on a date
// Body: { classId, date, records: [{ studentId, status, remark }] }
export const takeAttendance = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || !records.length)
      return res.status(400).json({ success: false, message: "classId, date, and records[] are required" });

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate))
      return res.status(400).json({ success: false, message: "Invalid date" });

    const ops = records.map(({ studentId, status, remark = "" }) => {
      if (!VALID_STATUSES.includes(status)) return null;
      return {
        updateOne: {
          filter: { studentId, classId, date: attendanceDate },
          update: {
            $set: {
              studentId,
              classId,
              teacherId,
              academicYearId: activeYear._id,
              date: attendanceDate,
              status,
              remark,
              isSubmitted: false,
            },
          },
          upsert: true,
        },
      };
    }).filter(Boolean);

    if (!ops.length)
      return res.status(400).json({ success: false, message: "No valid records provided" });

    await Attendance.bulkWrite(ops);

    return res.status(200).json({ success: true, message: "Attendance saved", count: ops.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/attendance/submit  — teacher submits (locks) attendance for a class+date
export const submitAttendance = async (req, res) => {
  try {
    const { classId, date } = req.body;
    if (!classId || !date)
      return res.status(400).json({ success: false, message: "classId and date are required" });

    const result = await Attendance.updateMany(
      { classId, date: new Date(date), isSubmitted: false },
      { $set: { isSubmitted: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Attendance submitted",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/class/:classId  — get attendance for a class (optionally filter by date)
export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const query = { classId };
    if (date) query.date = new Date(date);

    const records = await Attendance.find(query)
      .populate("studentId", "firstName lastName username")
      .sort({ date: -1, "studentId.firstName": 1 });

    return res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/student/:studentId  — get attendance history for a student
export const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId })
      .populate("classId", "name grade")
      .populate("teacherId", "firstName lastName")
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;

    return res.status(200).json({
      success: true,
      summary: { total, present, absent, late, excused },
      records,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/attendance/report  — admin/director summary by class and date range
export const getAttendanceReport = async (req, res) => {
  try {
    const { classId, from, to } = req.query;
    const query = {};
    if (classId) query.classId = classId;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const records = await Attendance.find(query)
      .populate("studentId", "firstName lastName")
      .populate("classId", "name grade stream")
      .sort({ date: -1 });

    return res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
