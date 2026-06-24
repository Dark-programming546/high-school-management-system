import Mark from "../models/Mark.js";

// PATCH /api/approval/mark/:id
export const approveMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: "Mark not found",
      });
    }

    if (mark.status !== "REVIEWED") {
      return res.status(400).json({
        success: false,
        message: "Mark must be reviewed first",
      });
    }

    mark.status = "APPROVED";
    await mark.save();

    return res.status(200).json({
      success: true,
      message: "Mark approved by admin",
      mark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/approval/publish/:classId/:semester
export const publishResults = async (req, res) => {
  try {
    const { classId, semester } = req.params;

    const updateResult = await Mark.updateMany(
      {
        classId,
        semester,
        status: "APPROVED",
      },
      {
        status: "PUBLISHED",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Results published successfully",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
