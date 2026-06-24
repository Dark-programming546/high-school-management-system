import Mark from "../models/Mark.js";
import Result from "../models/Result.js";
import AcademicYear from "../models/AcademicYear.js";

export const calculateFinalResult = async (studentId, classId) => {
  const activeYear = await AcademicYear.findOne({ isActive: true });

  if (!activeYear) {
    throw new Error("No active academic year found");
  }

  const marks = await Mark.find({
    studentId,
    classId,
    academicYearId: activeYear._id,
  });

  if (!marks.length) {
    throw new Error("No marks found for student");
  }

  let total = 0;
  let failed = 0;

  marks.forEach((m) => {
    total += m.total;
    if (m.total < 50) {
      failed += 1;
    }
  });

  const average = total / marks.length;
  let status = "PASS";

  if (failed >= 4) status = "FAIL";
  else if (failed === 0) status = "PASS";
  else if (failed === 1 && average < 51) status = "REPEAT";
  else if (failed === 2 && average < 53) status = "REPEAT";
  else if (failed === 3 && average < 55) status = "REPEAT";
  else if (status !== "FAIL") status = "PASS";

  const result = await Result.findOneAndUpdate(
    {
      studentId,
      academicYearId: activeYear._id,
    },
    {
      studentId,
      classId,
      academicYearId: activeYear._id,
      totalScore: total,
      averageScore: Number(average.toFixed(2)),
      failedSubjectsCount: failed,
      status,
    },
    { upsert: true, new: true }
  );

  return result;
};
