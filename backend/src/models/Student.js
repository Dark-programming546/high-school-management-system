import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
    },

    dateOfBirth: Date,

    phone: {
      type: String,
      trim: true,
    },

    currentGrade: {
      type: Number,
      enum: [9, 10, 11, 12],
      required: true,
    },

    currentClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },

    section: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    stream: {
      type: String,
      enum: ["NONE", "NATURAL", "SOCIAL"],
      default: "NONE",
    },

    selectedStream: {
      type: String,
      enum: ["NATURAL", "SOCIAL"],
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "GRADUATED"],
      default: "PENDING",
    },

    ministryResult: {
      fileUrl: {
        type: String,
        trim: true,
      },
      averageScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,

    transferNote: {
      reason: { type: String, default: "" },
      transferTo: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Student", studentSchema);
