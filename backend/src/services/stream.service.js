import Student from "../models/Student.js";
import Mark from "../models/Mark.js";

/**
 * Determine stream based on different methods
 */
export const decideStream = async (studentId) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const marks = await Mark.find({ studentId }).populate("subjectId", "name");

  if (!marks.length) {
    return "NONE";
  }

  let socialScore = 0;
  let naturalScore = 0;

  marks.forEach((mark) => {
    const name = mark.subjectId?.name?.toLowerCase() || "";

    if (name.includes("history") || name.includes("geography") || name.includes("economics")) {
      socialScore += mark.total;
    }

    if (name.includes("physics") || name.includes("chemistry") || name.includes("biology")) {
      naturalScore += mark.total;
    }
  });

  if (naturalScore > socialScore) {
    return "NATURAL";
  } else if (socialScore > naturalScore) {
    return "SOCIAL";
  }

  return "SOCIAL";
};
