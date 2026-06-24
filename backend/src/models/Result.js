import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    averageScore: {
      type: Number,
      default: 0,
    },

    failedSubjectsCount: {
      type: Number,
      default: 0,
    },

    rank: {
      type: Number,
      default: null,
    },

    classRank: {
      type: Number,
      default: null,
    },

    schoolRank: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["PASS", "FAIL", "REPEAT", "GRADUATED"],
      default: "PASS",
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index(
  { studentId: 1, academicYearId: 1 },
  { unique: true }
);

export default mongoose.model("Result", resultSchema);
