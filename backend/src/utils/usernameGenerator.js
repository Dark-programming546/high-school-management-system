import Student from "../models/Student.js";

/**
 * Generate a unique username: <firstInitial><lastName><2-digit-year>
 * e.g. Habtamu Alemu enrolled 2024 → halemu24
 * Falls back to appending incrementing counter on collision.
 */
export const generateUsername = async (firstName, lastName, enrollmentYear) => {
  const base =
    (firstName[0] + lastName).toLowerCase().replace(/\s+/g, "").slice(0, 12);
  const year = String(enrollmentYear).slice(-2);
  let candidate = `${base}${year}`;

  let counter = 1;
  while (await Student.findOne({ username: candidate })) {
    candidate = `${base}${year}${counter}`;
    counter++;
  }

  return candidate;
};
