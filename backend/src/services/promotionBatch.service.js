import Student from "../models/Student.js";
import Class from "../models/Class.js";
import { evaluatePass } from "./promotion.service.js";

const extractSection = (className) => {
  if (!className) return null;
  const match = className.match(/([A-Za-z]+)$/);
  return match ? match[1].toUpperCase() : null;
};

const assignNextClass = async (student, nextGrade, stream, preserveSection) => {
  const query = { grade: nextGrade, academicYearId: student.academicYearId };
  if (stream) query.stream = stream;

  if (preserveSection && student.section) {
    const sectionClass = await Class.findOne({
      ...query,
      name: new RegExp(`${nextGrade}${student.section}$`, "i"),
    });
    if (sectionClass) return { classId: sectionClass._id, section: student.section };
  }

  const nextClass = await Class.findOne(query).sort({ name: 1 });
  if (!nextClass) return { classId: null, section: null };
  return { classId: nextClass._id, section: extractSection(nextClass.name) };
};

/**
 * Promote all students at end of year.
 * For 10→11: uses student.selectedStream (set by registrar/student before batch run).
 */
export const promoteAllStudents = async (students) => {
  const results = [];

  for (const student of students) {
    const { _id, currentGrade } = student;
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
    let targetStream = null;
    let preserveSection = false;

    if (currentGrade === 9) {
      nextGrade = 10;
      preserveSection = true;
    } else if (currentGrade === 10) {
      // selectedStream must be set on the student record before batch promotion
      if (!student.selectedStream || !["NATURAL", "SOCIAL"].includes(student.selectedStream)) {
        results.push({ studentId: _id, status: "SKIPPED", reason: "Missing stream selection for grade 10" });
        continue;
      }
      nextGrade = 11;
      targetStream = student.selectedStream;
      preserveSection = false;
    } else if (currentGrade === 11) {
      nextGrade = 12;
      preserveSection = true;
      targetStream = student.stream !== "NONE" ? student.stream : null;
    } else if (currentGrade === 12) {
      student.status = "GRADUATED";
      await student.save();
      results.push({ studentId: _id, status: "GRADUATED" });
      continue;
    } else {
      continue;
    }

    student.currentGrade = nextGrade;
    if (targetStream) student.stream = targetStream;
    student.status = "APPROVED";

    const { classId, section } = await assignNextClass(student, nextGrade, targetStream, preserveSection);
    student.currentClassId = classId;
    student.section = section;

    await student.save();

    results.push({
      studentId: _id,
      status: "PROMOTED",
      newGrade: student.currentGrade,
      stream: student.stream,
      section: student.section,
      currentClassId: student.currentClassId,
    });
  }

  return results;
};
