import TeachingAssignment from "../models/TeachingAssignment.js";
import Teacher from "../models/Teacher.js";
import Subject from "../models/Subject.js";
import Class from "../models/Class.js";
import AcademicYear from "../models/AcademicYear.js";

// POST /api/teaching-assignments
export const createTeachingAssignment = async (req, res) => {
  try {
    const { teacherId, subjectId, classId } = req.body;

    if (!teacherId || !subjectId || !classId) {
      return res.status(400).json({
        success: false,
        message: "Teacher, subject, and class are required",
      });
    }

    const activeYear = await AcademicYear.findOne({ isActive: true });

    if (!activeYear) {
      return res.status(400).json({
        success: false,
        message: "No active academic year found",
      });
    }

    const [teacher, subject, schoolClass] = await Promise.all([
      Teacher.findOne({ _id: teacherId, isActive: true }),
      Subject.findOne({ _id: subjectId, isActive: true }),
      Class.findOne({ _id: classId, academicYearId: activeYear._id }),
    ]);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Active teacher not found",
      });
    }

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Active subject not found",
      });
    }

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found in the active academic year",
      });
    }

    const assignment = await TeachingAssignment.create({
      teacherId,
      subjectId,
      classId,
      academicYearId: activeYear._id,
    });

    const populatedAssignment = await TeachingAssignment.findById(
      assignment._id
    )
      .populate("teacherId", "firstName lastName employeeId")
      .populate("subjectId", "name code")
      .populate("classId", "name grade stream")
      .populate("academicYearId", "name");

    return res.status(201).json({
      success: true,
      message: "Teacher assigned successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This subject already has a teacher assigned in this class for the active academic year",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/teaching-assignments
export const getTeachingAssignments = async (req, res) => {
  try {
    const assignments = await TeachingAssignment.find()
      .populate("teacherId", "firstName lastName employeeId")
      .populate("subjectId", "name code")
      .populate("classId", "name grade stream")
      .populate("academicYearId", "name isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/teaching-assignments/:id
export const deleteTeachingAssignment = async (req, res) => {
  try {
    const assignment = await TeachingAssignment.findByIdAndDelete(
      req.params.id
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Teaching assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teaching assignment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
