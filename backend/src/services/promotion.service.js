import Student from "../models/Student.js";
import Class from "../models/Class.js";

/**
 * Determine if student passes based on failed subjects count + average
 */
export const evaluatePass = (failedCount, average) => {
  if (failedCount >= 4) return false;
  if (failedCount === 0) return true;
  if (failedCount === 1) return average >= 51;
  if (failedCount === 2) return average >= 53;
  if (failedCount === 3) return average >= 55;
  return false;
};

const validateStream = (stream) => ["NATURAL", "SOCIAL"].includes(stream);

/**
 * Extract section letter from class name, e.g. "9C" → "C", "11A" → "A"
 */
const extractSection = (className) => {
  if (!className) return null;
  const match = className.match(/([A-Za-z]+)$/);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Assign next class:
 * - 9→10 and 11→12: preserve same section letter
 * - 10→11: stream-based, assign to first available section in that stream
 */
const assignNextClass = async (student, nextGrade, stream, preserveSection) => {
  const query = {
    grade: nextGrade,
    academicYearId: student.academicYearId,
  };

  if (stream) query.stream = stream;

  if (preserveSection && student.section) {
    // Try to find the class with the same section letter
    const sectionClass = await Class.findOne({
      ...query,
      name: new RegExp(`${nextGrade}${student.section}$`, "i"),
    });
    if (sectionClass) return { classId: sectionClass._id, section: student.section };
  }

  // Fallback: first available class sorted by name
  const nextClass = await Class.findOne(query).sort({ name: 1 });
  if (!nextClass) return { classId: null, section: null };

  return { classId: nextClass._id, section: extractSection(nextClass.name) };
};

/**
 * Promote student to next grade
 */
export const promoteStudent = async (studentId, resultData) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.status === "GRADUATED") {
    throw new Error("This student has already graduated");
  }

  const {
    failedSubjectsCount,
    averageScore,
    selectedStream,
  } = resultData;

  if (
    typeof failedSubjectsCount !== "number" ||
    failedSubjectsCount < 0 ||
    !Number.isInteger(failedSubjectsCount)
  ) {
    throw new Error("failedSubjectsCount must be a non-negative integer");
  }

  if (
    typeof averageScore !== "number" ||
    averageScore < 0 ||
    averageScore > 100
  ) {
    throw new Error("averageScore must be a number between 0 and 100");
  }

  const passed = evaluatePass(failedSubjectsCount, averageScore);

  if (!passed) {
    student.status = "REJECTED";
    await student.save();
    return { status: "REPEAT", student };
  }

  let nextGrade = null;
  let targetStream = null;
  let preserveSection = false;

  if (student.currentGrade === 9) {
    nextGrade = 10;
    preserveSection = true; // 9C → 10C
  } else if (student.currentGrade === 10) {
    if (!selectedStream || !validateStream(selectedStream)) {
      throw new Error("A valid selectedStream is required for 10 → 11 promotion");
    }
    nextGrade = 11;
    targetStream = selectedStream;
    preserveSection = false; // stream selection resets section assignment
  } else if (student.currentGrade === 11) {
    nextGrade = 12;
    preserveSection = true; // 11B → 12B (same stream)
    targetStream = student.stream !== "NONE" ? student.stream : null;
  } else if (student.currentGrade === 12) {
    student.status = "GRADUATED";
    await student.save();
    return { status: "GRADUATED", student };
  } else {
    throw new Error("Invalid student grade for promotion");
  }

  student.currentGrade = nextGrade;
  if (targetStream) student.stream = targetStream;

  student.status = "APPROVED";

  const { classId, section } = await assignNextClass(student, nextGrade, targetStream, preserveSection);
  student.currentClassId = classId;
  student.section = section;

  await student.save();

  return { status: "PROMOTED", student };
};
