import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/", createSubject);
router.get("/", getSubjects);
router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
