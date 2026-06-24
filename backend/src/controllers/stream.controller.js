import Student from "../models/Student.js";
import { decideStream } from "../services/stream.service.js";

// POST /api/stream/assign/:studentId
export const assignStream = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const stream = await decideStream(student._id);

    student.stream = stream;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Stream assigned successfully",
      stream,
      student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
