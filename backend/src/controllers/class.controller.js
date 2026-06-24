import Class from "../models/Class.js";
import AcademicYear from "../models/AcademicYear.js";
import Teacher from "../models/Teacher.js";

// POST /api/classes
export const createClass = async (req, res) => {
  try {
    const { name, grade, stream, capacity } = req.body;

    if (!name || grade === undefined) {
      return res.status(400).json({
        success: false,
        message: "Class name and grade are required",
      });
    }

    const activeYear = await AcademicYear.findOne({ isActive: true });

    if (!activeYear) {
      return res.status(400).json({
        success: false,
        message: "No active academic year found. Activate an academic year first.",
      });
    }

    const schoolClass = await Class.create({
      name,
      grade,
      stream,
      capacity,
      academicYearId: activeYear._id,
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: schoolClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This class already exists in the active academic year",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/classes
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("academicYearId", "name isActive")
      .populate("classBossId", "firstName lastName employeeId")
      .sort({ grade: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/classes/:id
export const updateClass = async (req, res) => {
  try {
    const { name, grade, stream, capacity } = req.body;

    const schoolClass = await Class.findById(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (name !== undefined) schoolClass.name = name;
    if (grade !== undefined) schoolClass.grade = grade;
    if (stream !== undefined) schoolClass.stream = stream;
    if (capacity !== undefined) schoolClass.capacity = capacity;

    await schoolClass.save();

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      class: schoolClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This class already exists in this academic year",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/classes/:id
export const deleteClass = async (req, res) => {
  try {
    const schoolClass = await Class.findByIdAndDelete(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/classes/:id/class-boss
export const assignClassBoss = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const schoolClass = await Class.findById(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const teacher = await Teacher.findOne({
      _id: teacherId,
      isActive: true,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Active teacher not found",
      });
    }

    schoolClass.classBossId = teacher._id;
    await schoolClass.save();

    const updatedClass = await Class.findById(schoolClass._id)
      .populate("academicYearId", "name isActive")
      .populate("classBossId", "firstName lastName employeeId");

    return res.status(200).json({
      success: true,
      message: "Class boss assigned successfully",
      class: updatedClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/classes/:id/remove-class-boss
export const removeClassBoss = async (req, res) => {
  try {
    const schoolClass = await Class.findById(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    schoolClass.classBossId = null;
    await schoolClass.save();

    return res.status(200).json({
      success: true,
      message: "Class boss removed successfully",
      class: schoolClass,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
