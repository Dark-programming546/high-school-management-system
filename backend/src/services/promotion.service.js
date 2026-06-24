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

const assignNextClass = async (student, nextGrade, stream) => {
  const query = {
    grade: nextGrade,
    academicYearId: student.academicYearId,
  };

  if (stream) {
    query.stream = stream;
  }

  const nextClass = await Class.findOne(query).sort({ name: 1 });

  return nextClass ? nextClass._id : null;
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

  if (student.currentGrade === 9) {
    nextGrade = 10;
  } else if (student.currentGrade === 10) {
    if (!selectedStream || !validateStream(selectedStream)) {
      throw new Error("A valid selectedStream is required for 10 → 11 promotion");
    }
    nextGrade = 11;
    targetStream = selectedStream;
  } else if (student.currentGrade === 11) {
    nextGrade = 12;
  } else if (student.currentGrade === 12) {
    student.status = "GRADUATED";
    await student.save();
    return { status: "GRADUATED", student };
  } else {
    throw new Error("Invalid student grade for promotion");
  }

  student.currentGrade = nextGrade;
  if (targetStream) {
    student.stream = targetStream;
  }

  student.status = "APPROVED";
  student.currentClassId = await assignNextClass(student, nextGrade, targetStream);

  await student.save();

  return { status: "PROMOTED", student };
};
