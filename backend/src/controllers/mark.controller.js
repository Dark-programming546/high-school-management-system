import Mark from "../models/Mark.js";
import Student from "../models/Student.js";
import { calculateTotal } from "../services/mark.service.js";
import AcademicYear from "../models/AcademicYear.js";

const isValidNumber = (value) =>
  typeof value === "number" && !Number.isNaN(value) && value >= 0 && value <= 100;

// POST /api/marks
export const createOrUpdateMark = async (req, res) => {
  try {
    const {
      studentId,
      subjectId,
      classId,
      semester,
      assignment,
      quiz,
      mid,
      final,
    } = req.body;

    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized teacher",
      });
    }

    if (!studentId || !subjectId || !classId || !semester) {
      return res.status(400).json({
        success: false,
        message: "studentId, subjectId, classId, and semester are required",
      });
    }

    if (![1, 2].includes(semester)) {
      return res.status(400).json({
        success: false,
        message: "Semester must be 1 or 2",
      });
    }

    const scoreFields = { assignment, quiz, mid, final };
    const invalidScore = Object.entries(scoreFields).find(
      ([, value]) => !isValidNumber(value)
    );

    if (invalidScore) {
      return res.status(400).json({
        success: false,
        message: `${invalidScore[0]} must be a number between 0 and 100`,
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear) {
      return res.status(400).json({
        success: false,
        message: "No active academic year found",
      });
    }

    const total = await calculateTotal(
      student.currentGrade,
      assignment,
      quiz,
      mid,
      final
    );

    const existingMark = await Mark.findOne({
      studentId,
      subjectId,
      semester,
    });

    if (
      existingMark &&
      ["REVIEWED", "APPROVED", "PUBLISHED"].includes(existingMark.status)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This mark can no longer be updated because it has entered the approval workflow",
      });
    }

    const mark = await Mark.findOneAndUpdate(
      {
        studentId,
        subjectId,
        semester,
      },
      {
        studentId,
        subjectId,
        classId,
        teacherId,
        academicYearId: activeYear._id,
        semester,
        assignment,
        quiz,
        mid,
        final,
        total,
        status: "SUBMITTED",
        isSubmitted: true,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Mark saved successfully",
      mark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/marks/student/:id
export const getStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id;
    const marks = await Mark.find({ studentId })
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName")
      .sort({ semester: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
