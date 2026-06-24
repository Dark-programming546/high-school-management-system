import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    semester: {
      type: Number,
      enum: [1, 2],
      required: true,
    },

    assignment: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    quiz: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    mid: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    final: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    total: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "REVIEWED", "APPROVED", "PUBLISHED"],
      default: "DRAFT",
    },

    isSubmitted: {
      type: Boolean,
      default: false,
    },

    isReviewed: {
      type: Boolean,
      default: false,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    reviewComment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

markSchema.index(
  { studentId: 1, subjectId: 1, semester: 1 },
  { unique: true }
);

export default mongoose.model("Mark", markSchema);
