import Student from "../models/Student.js";
import Mark from "../models/Mark.js";
import Result from "../models/Result.js";
import AcademicYear from "../models/AcademicYear.js";
import { getStudentSubjects } from "../services/enrollment.service.js";

// POST /api/registrar/students/:id/transfer
// Marks student as transferred (REJECTED status) with a transfer note
export const transferStudent = async (req, res) => {
  try {
    const { reason, transferTo } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    if (student.status === "GRADUATED")
      return res.status(400).json({ success: false, message: "Graduated students cannot be transferred" });

    student.status = "REJECTED";
    student.transferNote = { reason: reason || "Transfer", transferTo: transferTo || "" };
    await student.save();

    return res.status(200).json({ success: true, message: "Student transferred successfully", student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/registrar/students/:id/graduate
export const graduateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    if (student.currentGrade !== 12)
      return res.status(400).json({ success: false, message: "Only Grade 12 students can be graduated" });

    student.status = "GRADUATED";
    await student.save();

    return res.status(200).json({ success: true, message: "Student graduated successfully", student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrar/students/:id/id-card  — data for printing student ID card
export const getStudentIdCard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name")
      .select("-password");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    return res.status(200).json({
      success: true,
      idCard: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        username: student.username,
        gender: student.gender,
        currentGrade: student.currentGrade,
        stream: student.stream,
        section: student.section,
        class: student.currentClassId,
        academicYear: student.academicYearId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrar/students/:id/transcript  — full academic transcript
export const getStudentTranscript = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name")
      .select("-password");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const activeYear = await AcademicYear.findOne({ isActive: true });

    const [marks, result, subjects] = await Promise.all([
      Mark.find({ studentId: student._id, status: "PUBLISHED" })
        .populate("subjectId", "name code")
        .populate("academicYearId", "name")
        .sort({ "academicYearId.name": 1, semester: 1 }),
      Result.findOne({ studentId: student._id, ...(activeYear ? { academicYearId: activeYear._id } : {}) }),
      activeYear ? getStudentSubjects(student._id, activeYear._id) : [],
    ]);

    return res.status(200).json({
      success: true,
      transcript: {
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          username: student.username,
          currentGrade: student.currentGrade,
          stream: student.stream,
          section: student.section,
          status: student.status,
        },
        enrolledSubjects: subjects,
        marks,
        result: result || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrar/students/:id/enrollment-certificate
export const getEnrollmentCertificate = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("currentClassId", "name grade stream")
      .populate("academicYearId", "name")
      .select("-password");

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    if (student.status !== "APPROVED")
      return res.status(400).json({ success: false, message: "Certificate only available for approved students" });

    return res.status(200).json({
      success: true,
      certificate: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        currentGrade: student.currentGrade,
        stream: student.stream,
        section: student.section,
        class: student.currentClassId,
        academicYear: student.academicYearId,
        issuedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
