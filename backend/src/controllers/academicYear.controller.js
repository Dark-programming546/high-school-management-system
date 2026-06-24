import AcademicYear from "../models/AcademicYear.js";

// POST /api/academic-years
export const createAcademicYear = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Academic year name is required",
      });
    }

    const existingYear = await AcademicYear.findOne({ name });

    if (existingYear) {
      return res.status(409).json({
        success: false,
        message: "Academic year already exists",
      });
    }

    const academicYear = await AcademicYear.create({
      name,
    });

    return res.status(201).json({
      success: true,
      message: "Academic year created successfully",
      academicYear,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/academic-years
export const getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: academicYears.length,
      academicYears,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PATCH /api/academic-years/:id/activate
export const activateAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found",
      });
    }

    // First deactivate every year.
    await AcademicYear.updateMany({}, { isActive: false });

    // Then activate the selected year.
    academicYear.isActive = true;
    await academicYear.save();

    return res.status(200).json({
      success: true,
      message: `${academicYear.name} is now the active academic year`,
      academicYear,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
