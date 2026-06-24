import express from "express";
import authRole from "../middleware/authRole.js";
import authUser from "../middleware/authUser.js";
import {
  schoolRanking,
  classRanking,
  topStudents,
  getClassRanking,
} from "../controllers/ranking.controller.js";

const router = express.Router();

// Admin only: trigger ranking calculations
router.post("/school",          authRole("ADMIN"), schoolRanking);
router.post("/class/:classId",  authRole("ADMIN"), classRanking);

// All staff and teachers: read rankings
router.get("/top3",             authUser, topStudents);
router.get("/class/:classId",   authUser, getClassRanking);

export default router;
