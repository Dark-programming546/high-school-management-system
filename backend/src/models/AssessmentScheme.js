import mongoose from "mongoose";

const assessmentSchemeSchema = new mongoose.Schema(
  {
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    grade: {
      type: Number,
      enum: [9, 10, 11, 12],
      required: true,
    },

    assignmentWeight: {
      type: Number,
      required: true,
      default: 10,
      min: [0, "Assignment weight cannot be negative"],
    },

    quizWeight: {
      type: Number,
      required: true,
      default: 10,
      min: [0, "Quiz weight cannot be negative"],
    },

    midWeight: {
      type: Number,
      required: true,
      default: 20,
      min: [0, "Mid weight cannot be negative"],
    },

    finalWeight: {
      type: Number,
      required: true,
      default: 60,
      min: [0, "Final weight cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

assessmentSchemeSchema.index(
  { academicYearId: 1, grade: 1 },
  { unique: true }
);

export default mongoose.model("AssessmentScheme", assessmentSchemeSchema);
