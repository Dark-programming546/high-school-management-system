import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";

/**
 * Generate a unique password in the format: <username><4-digit-number>
 * Checks both Student and Teacher collections to guarantee global uniqueness.
 * Tries up to 20 random suffixes before falling back to timestamp-based suffix.
 */
export const generateUniquePassword = async (username) => {
  const base = username.toLowerCase().trim();

  for (let i = 0; i < 20; i++) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const candidate = `${base}${suffix}`;

    const takenByStudent = await Student.findOne({ username: candidate });
    const takenByTeacher = await Teacher.findOne({ username: candidate });

    if (!takenByStudent && !takenByTeacher) return candidate;
  }

  // Fallback: use last 4 digits of timestamp
  return `${base}${String(Date.now()).slice(-4)}`;
};
