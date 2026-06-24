import Student from "../models/Student.js";
import Class from "../models/Class.js";
import { evaluatePass } from "./promotion.service.js";
import { decideStream } from "./stream.service.js";

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
 * Promote all students at end of year
 */
export const promoteAllStudents = async (students) => {
  const results = [];

  for (const student of students) {
    const {
      _id,
      currentGrade,
    } = student;

    const failedSubjectsCount = student.failedSubjectsCount || 0;
    const averageScore = student.averageScore || 50;

    const passed = evaluatePass(failedSubjectsCount, averageScore);

    if (!passed) {
      student.status = "REPEAT";
      await student.save();

      results.push({ studentId: _id, status: "REPEAT" });
      continue;
    }

    let nextGrade = null;
    let stream = student.stream;

    if (currentGrade === 9) {
      nextGrade = 10;
      stream = "NONE";
    } else if (currentGrade === 10) {
      nextGrade = 11;
      stream = await decideStream(_id);
    } else if (currentGrade === 11) {
      nextGrade = 12;
    } else if (currentGrade === 12) {
      student.status = "GRADUATED";
      await student.save();

      results.push({ studentId: _id, status: "GRADUATED" });
      continue;
    }

    student.currentGrade = nextGrade;
    student.stream = stream;
    student.status = "APPROVED";
    student.currentClassId = await assignNextClass(student, nextGrade, stream);

    await student.save();

    results.push({
      studentId: _id,
      status: "PROMOTED",
      newGrade: student.currentGrade,
      stream: student.stream,
      currentClassId: student.currentClassId,
    });
  }

  return results;
};
