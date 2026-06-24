import { promoteStudent } from "../services/promotion.service.js";
import Student from "../models/Student.js";

const validateStream = (stream) => ["NATURAL", "SOCIAL"].includes(stream);

// POST /api/promotion/promote/:studentId
export const promote = async (req, res) => {
  try {
    const { failedSubjectsCount, averageScore, selectedStream } = req.body;

    if (typeof failedSubjectsCount !== "number" || failedSubjectsCount < 0) {
      return res.status(400).json({
        success: false,
        message: "failedSubjectsCount must be a non-negative number",
      });
    }

    if (typeof averageScore !== "number" || averageScore < 0 || averageScore > 100) {
      return res.status(400).json({
        success: false,
        message: "averageScore must be a number between 0 and 100",
      });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.currentGrade === 10 && !validateStream(selectedStream)) {
      return res.status(400).json({
        success: false,
        message: "selectedStream is required and must be either NATURAL or SOCIAL",
      });
    }

    const result = await promoteStudent(req.params.studentId, {
      failedSubjectsCount,
      averageScore,
      selectedStream,
    });

    return res.status(200).json({
      success: true,
      message: `Student ${result.status}`,
      student: result.student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/promotion/check/:studentId
export const checkStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name isActive");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
