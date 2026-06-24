import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const STAFF_ACCOUNTS = [
  {
    username: "registrar",
    password: "registrar123",
    role: "REGISTRAR",
    firstName: "School",
    lastName: "Registrar",
  },
  {
    username: "director",
    password: "director123",
    role: "DIRECTOR",
    firstName: "School",
    lastName: "Director",
  },
  {
    username: "vicedirector",
    password: "vicedirector123",
    role: "VICE_DIRECTOR",
    firstName: "School",
    lastName: "Vice Director",
  },
];

const createStaffAccounts = async () => {
  try {
    await connectDB();

    for (const account of STAFF_ACCOUNTS) {
      const existing = await Admin.findOne({ username: account.username });
      if (existing) {
        console.log(`${account.role} already exists: ${account.username}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(account.password, 10);
      await Admin.create({ ...account, password: hashedPassword });
      console.log(`✓ Created ${account.role}: ${account.username} / ${account.password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createStaffAccounts();
