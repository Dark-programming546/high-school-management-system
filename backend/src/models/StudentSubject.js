import mongoose from "mongoose";

const studentSubjectSchema = new mongoose.Schema(
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

    stream: {
      type: String,
      enum: ["NONE", "NATURAL", "SOCIAL"],
      default: "NONE",
    },
  },
  { timestamps: true }
);

studentSubjectSchema.index(
  { studentId: 1, subjectId: 1, academicYearId: 1 },
  { unique: true }
);

export default mongoose.model("StudentSubject", studentSubjectSchema);
