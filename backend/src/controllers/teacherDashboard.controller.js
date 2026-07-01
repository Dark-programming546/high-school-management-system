import TeachingAssignment from "../models/TeachingAssignment.js";
import Student from "../models/Student.js";
import Mark from "../models/Mark.js";
import AcademicYear from "../models/AcademicYear.js";

// GET /api/teacher/my-classes  — classes assigned to the logged-in teacher
export const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    const assignments = await TeachingAssignment.find({
      teacherId,
      academicYearId: activeYear._id,
      isActive: true,
    })
      .populate("subjectId", "name code")
      .populate("classId", "name grade stream")
      .sort({ "classId.name": 1 });

    return res.status(200).json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teacher/my-classes/:classId/students  — students in a class the teacher is assigned to
export const getClassStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId } = req.params;

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear)
      return res.status(400).json({ success: false, message: "No active academic year" });

    // Verify teacher is assigned to this class
    const assignment = await TeachingAssignment.findOne({
      teacherId,
      classId,
      academicYearId: activeYear._id,
      isActive: true,
    });

    if (!assignment)
      return res.status(403).json({ success: false, message: "You are not assigned to this class" });

    const students = await Student.find({
      currentClassId: classId,
      status: "APPROVED",
    })
      .select("firstName lastName username currentGrade stream section")
      .sort({ firstName: 1 });

    return res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teacher/my-marks/:classId/:subjectId  — marks entered by this teacher for a class+subject
export const getMyMarks = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { classId, subjectId } = req.params;
    const { semester } = req.query;

    const query = { teacherId, classId, subjectId };
    if (semester) query.semester = Number(semester);

    const marks = await Mark.find(query)
      .populate("studentId", "firstName lastName username")
      .sort({ "studentId.firstName": 1 });

    return res.status(200).json({ success: true, count: marks.length, marks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/teacher/profile  — teacher's own profile
export const getTeacherProfile = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isActive: true });

    const assignments = await TeachingAssignment.find({
      teacherId: req.user.id,
      ...(activeYear ? { academicYearId: activeYear._id } : {}),
      isActive: true,
    })
      .populate("subjectId", "name code")
      .populate("classId", "name grade stream");

    return res.status(200).json({
      success: true,
      teacher: req.user,
      assignedClasses: assignments.length,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
