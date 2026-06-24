import Teacher from "../models/Teacher.js";

// POST /api/teachers
export const createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, employeeId, phone, email } = req.body;

    if (!firstName || !lastName || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, and employee ID are required",
      });
    }

    const teacher = await Teacher.create({
      firstName,
      lastName,
      employeeId,
      phone,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A teacher with this employee ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({
      firstName: 1,
      lastName: 1,
    });

    return res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/teachers/:id
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/teachers/:id
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const { firstName, lastName, employeeId, phone, email, isActive } = req.body;

    if (firstName !== undefined) teacher.firstName = firstName;
    if (lastName !== undefined) teacher.lastName = lastName;
    if (employeeId !== undefined) teacher.employeeId = employeeId;
    if (phone !== undefined) teacher.phone = phone;
    if (email !== undefined) teacher.email = email;
    if (isActive !== undefined) teacher.isActive = isActive;

    await teacher.save();

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A teacher with this employee ID already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/teachers/:id
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
