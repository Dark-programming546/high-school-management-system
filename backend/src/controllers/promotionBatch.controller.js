import Student from "../models/Student.js";
import { promoteAllStudents } from "../services/promotionBatch.service.js";

// POST /api/promotion-batch/run
export const runPromotion = async (req, res) => {
  try {
    const students = await Student.find();

    const result = await promoteAllStudents(students);

    return res.status(200).json({
      success: true,
      message: "Promotion completed",
      count: result.length,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
