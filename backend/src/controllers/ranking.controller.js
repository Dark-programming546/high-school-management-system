import {
  calculateSchoolRanking,
  calculateClassRanking,
} from "../services/ranking.service.js";
import Result from "../models/Result.js";

// POST /api/ranking/school
export const schoolRanking = async (req, res) => {
  try {
    const results = await calculateSchoolRanking();

    return res.status(200).json({
      success: true,
      message: "School ranking calculated",
      count: results.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/ranking/class/:classId
export const classRanking = async (req, res) => {
  try {
    const results = await calculateClassRanking(req.params.classId);

    return res.status(200).json({
      success: true,
      message: "Class ranking calculated",
      count: results.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ranking/top3
export const topStudents = async (req, res) => {
  try {
    const top = await Result.find()
      .sort({ schoolRank: 1 })
      .limit(3)
      .populate("studentId", "firstName lastName currentGrade");

    return res.status(200).json({
      success: true,
      topStudents: top,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/ranking/class/:classId  — read-only for teachers
export const getClassRanking = async (req, res) => {
  try {
    const results = await Result.find({ classId: req.params.classId })
      .sort({ classRank: 1 })
      .populate("studentId", "firstName lastName");

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
