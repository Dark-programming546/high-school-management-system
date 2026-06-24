import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },

    grade: {
      type: Number,
      required: [true, "Grade is required"],
      enum: [9, 10, 11, 12],
    },

    stream: {
      type: String,
      enum: ["NONE", "NATURAL", "SOCIAL"],
      default: "NONE",
    },

    capacity: {
      type: Number,
      default: 60,
      min: [1, "Capacity must be at least 1"],
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    classBossId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index(
  { name: 1, academicYearId: 1 },
  { unique: true }
);

export default mongoose.model("Class", classSchema);
