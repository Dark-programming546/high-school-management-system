import { calculateFinalResult } from "../services/result.service.js";
import Result from "../models/Result.js";

// POST /api/results/calculate
export const calculateResult = async (req, res) => {
  try {
    const { studentId, classId } = req.body;

    if (!studentId || !classId) {
      return res.status(400).json({
        success: false,
        message: "studentId and classId are required",
      });
    }

    const result = await calculateFinalResult(studentId, classId);

    return res.status(200).json({
      success: true,
      message: "Result calculated successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/results
export const getResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId", "firstName lastName currentGrade")
      .populate("classId", "name grade")
      .sort({ averageScore: -1 });

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
