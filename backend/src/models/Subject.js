import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      unique: true,
    },

    code: {
      type: String,
      required: [true, "Subject code is required"],
      trim: true,
      uppercase: true,
      unique: true,
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

export default mongoose.model("Subject", subjectSchema);
