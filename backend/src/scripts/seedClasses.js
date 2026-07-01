import dotenv from "dotenv";
import connectDB from "../config/db.js";
import AcademicYear from "../models/AcademicYear.js";
import Class from "../models/Class.js";

dotenv.config();

/**
 * 42 classes:
 *  Grade 9  : 13 sections (A–M), stream = NONE
 *  Grade 10 : 13 sections (A–M), stream = NONE
 *  Grade 11 :  8 sections — 4 NATURAL (A–D) + 4 SOCIAL (A–D)
 *  Grade 12 :  8 sections — 4 NATURAL (A–D) + 4 SOCIAL (A–D)
 */
const buildClassDefs = () => {
  const sections13 = "ABCDEFGHIJKLM".split("");
  const sections4  = "ABCD".split("");
  const defs = [];

  for (const s of sections13) {
    defs.push({ name: `9${s}`,  grade: 9,  stream: "NONE" });
    defs.push({ name: `10${s}`, grade: 10, stream: "NONE" });
  }

  for (const s of sections4) {
    defs.push({ name: `11${s}`, grade: 11, stream: "NATURAL" });
    defs.push({ name: `11${s}`, grade: 11, stream: "SOCIAL"  });
    defs.push({ name: `12${s}`, grade: 12, stream: "NATURAL" });
    defs.push({ name: `12${s}`, grade: 12, stream: "SOCIAL"  });
  }

  return defs;
};

const seedClasses = async () => {
  try {
    await connectDB();

    const activeYear = await AcademicYear.findOne({ isActive: true });
    if (!activeYear) {
      console.error("No active academic year found. Create and activate one first.");
      process.exit(1);
    }

    const defs = buildClassDefs();
    let created = 0;
    let skipped = 0;

    for (const def of defs) {
      const exists = await Class.findOne({
        name: def.name,
        stream: def.stream,
        academicYearId: activeYear._id,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await Class.create({ ...def, academicYearId: activeYear._id });
      created++;
    }

    console.log(`Done. Created: ${created}, Skipped (already exist): ${skipped}`);
    console.log(`Academic year: ${activeYear.name}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

seedClasses();
