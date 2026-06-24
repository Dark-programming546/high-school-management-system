import Mark from "../models/Mark.js";
import Class from "../models/Class.js";

// GET all marks for class boss review
// GET /api/review/class/:classId/:semester
export const getClassMarksForReview = async (req, res) => {
  try {
    const { classId, semester } = req.params;

    const marks = await Mark.find({
      classId,
      semester,
      status: "SUBMITTED",
    })
      .populate("studentId", "firstName lastName")
      .populate("subjectId", "name code")
      .populate("teacherId", "firstName lastName");

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

// PATCH review a mark
// PATCH /api/review/:markId
export const reviewMark = async (req, res) => {
  try {
    const { reviewComment } = req.body;

    const mark = await Mark.findById(req.params.markId);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Mark not found",
      });
    }

    if (mark.status !== "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Only submitted marks can be reviewed",
      });
    }

    mark.status = "REVIEWED";
    mark.isReviewed = true;
    mark.reviewedBy = req.user.id;
    mark.reviewComment = reviewComment || "Reviewed by class boss";

    await mark.save();

    return res.status(200).json({
      success: true,
      message: "Mark reviewed successfully",
      mark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
