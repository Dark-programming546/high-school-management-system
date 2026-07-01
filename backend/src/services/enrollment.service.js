import Subject from "../models/Subject.js";
import StudentSubject from "../models/StudentSubject.js";

/**
 * Fixed subject names per grade/stream as defined by the Ethiopian curriculum.
 */
const SUBJECT_MAP = {
  "9-NONE":       ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Geography", "History", "Afaan Oromoo", "Amharic", "Economics", "ICT", "Citizenship", "HPE"],
  "10-NONE":      ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Geography", "History", "Afaan Oromoo", "Amharic", "Economics", "ICT", "Citizenship", "HPE"],
  "11-NATURAL":   ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Agriculture", "IT", "Afaan Oromoo", "Amharic"],
  "11-SOCIAL":    ["Mathematics", "English", "History", "Geography", "Economics", "Afaan Oromoo", "Amharic"],
  "12-NATURAL":   ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Agriculture", "IT", "Afaan Oromoo", "Amharic"],
  "12-SOCIAL":    ["Mathematics", "English", "History", "Geography", "Economics", "Afaan Oromoo", "Amharic"],
};

/**
 * Auto-enroll a student in their fixed subjects based on grade and stream.
 * Skips subjects that don't exist in the Subject collection.
 * Returns count of enrolled subjects.
 */
export const enrollStudentSubjects = async (student, academicYearId) => {
  const stream = student.stream || "NONE";
  const key = `${student.currentGrade}-${stream}`;
  const subjectNames = SUBJECT_MAP[key] || [];

  if (!subjectNames.length) return 0;

  const subjects = await Subject.find({
    name: { $in: subjectNames },
    isActive: true,
  });

  if (!subjects.length) return 0;

  const docs = subjects.map((sub) => ({
    studentId: student._id,
    subjectId: sub._id,
    academicYearId,
    grade: student.currentGrade,
    stream,
  }));

  // insertMany with ordered:false skips duplicates without throwing
  const result = await StudentSubject.insertMany(docs, { ordered: false }).catch((err) => {
    if (err.code === 11000) return { insertedCount: 0 };
    throw err;
  });

  return result?.insertedCount ?? docs.length;
};

/**
 * Get all subjects enrolled for a student in the active academic year.
 */
export const getStudentSubjects = async (studentId, academicYearId) => {
  return StudentSubject.find({ studentId, academicYearId })
    .populate("subjectId", "name code")
    .sort({ "subjectId.name": 1 });
};
