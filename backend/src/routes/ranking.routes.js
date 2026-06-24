import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import authUser from "../middleware/authUser.js";
import {
  schoolRanking,
  classRanking,
  topStudents,
  getClassRanking,
} from "../controllers/ranking.controller.js";

const router = express.Router();

// Admin only: trigger ranking calculations
router.post("/school", authAdmin, schoolRanking);
router.post("/class/:classId", authAdmin, classRanking);

// Admin or Teacher: read top students and class ranking
router.get("/top3", authUser, topStudents);
router.get("/class/:classId", authUser, getClassRanking);

export default router;
