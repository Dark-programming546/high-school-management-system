import Result from "../models/Result.js";
import AcademicYear from "../models/AcademicYear.js";

/**
 * Rank all students in school (9-12)
 */
export const calculateSchoolRanking = async () => {
  const activeYear = await AcademicYear.findOne({ isActive: true });

  if (!activeYear) {
    throw new Error("No active academic year found");
  }

  const results = await Result.find({
    academicYearId: activeYear._id,
  }).sort({ averageScore: -1 });

  let rank = 1;

  for (const result of results) {
    result.schoolRank = rank;
    await result.save();
    rank++;
  }

  return results;
};

/**
 * Rank students within a class
 */
export const calculateClassRanking = async (classId) => {
  const results = await Result.find({ classId }).sort({ averageScore: -1 });

  let rank = 1;

  for (const result of results) {
    result.classRank = rank;
    await result.save();
    rank++;
  }

  return results;
};
