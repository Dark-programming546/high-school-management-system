import AssessmentScheme from "../models/AssessmentScheme.js";
import AcademicYear from "../models/AcademicYear.js";

const validateWeights = (assignmentWeight, quizWeight, midWeight) => {
  if (
    assignmentWeight === undefined ||
    quizWeight === undefined ||
    midWeight === undefined
  ) {
    return "Assignment, quiz, and mid weights are required";
  }

  const values = [assignmentWeight, quizWeight, midWeight];
  if (values.some((value) => typeof value !== "number" || Number.isNaN(value))) {
    return "All weights must be valid numbers";
  }

  if (values.some((value) => value < 0)) {
    return "Weights cannot be negative";
  }

  const total = assignmentWeight + quizWeight + midWeight + 60;
  if (total !== 100) {
    return "Weights must add up to 100 with final weight fixed at 60";
  }

  return null;
};

// POST /api/assessment-schemes
export const createScheme = async (req, res) => {
  try {
    const { grade, assignmentWeight, quizWeight, midWeight } = req.body;

    const activeYear = await AcademicYear.findOne({ isActive: true });

    if (!activeYear) {
      return res.status(400).json({
        success: false,
        message: "No active academic year found",
      });
    }

    const error = validateWeights(assignmentWeight, quizWeight, midWeight);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const scheme = await AssessmentScheme.create({
      academicYearId: activeYear._id,
      grade,
      assignmentWeight,
      quizWeight,
      midWeight,
      finalWeight: 60,
    });

    return res.status(201).json({
      success: true,
      message: "Assessment scheme created",
      scheme,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Scheme already exists for this grade in this year",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/assessment-schemes
export const getSchemes = async (req, res) => {
  try {
    const schemes = await AssessmentScheme.find()
      .populate("academicYearId", "name isActive")
      .sort({ grade: 1 });

    return res.status(200).json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/assessment-schemes/:id
export const updateScheme = async (req, res) => {
  try {
    const scheme = await AssessmentScheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    const { assignmentWeight, quizWeight, midWeight } = req.body;
    const error = validateWeights(
      assignmentWeight ?? scheme.assignmentWeight,
      quizWeight ?? scheme.quizWeight,
      midWeight ?? scheme.midWeight
    );
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (assignmentWeight !== undefined) scheme.assignmentWeight = assignmentWeight;
    if (quizWeight !== undefined) scheme.quizWeight = quizWeight;
    if (midWeight !== undefined) scheme.midWeight = midWeight;

    await scheme.save();

    return res.status(200).json({
      success: true,
      message: "Assessment scheme updated",
      scheme,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
