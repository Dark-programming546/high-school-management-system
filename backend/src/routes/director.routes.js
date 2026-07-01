import express from "express";
import { loginDirector } from "../controllers/staffAuth.controller.js";
import authRole from "../middleware/authRole.js";
import { getSchoolStats, getResultsOverview, getTeachersOverview } from "../controllers/director.controller.js";

const router = express.Router();

const directorAccess = authRole("ADMIN", "DIRECTOR");

router.post("/login", loginDirector);
router.get("/stats", directorAccess, getSchoolStats);
router.get("/results", directorAccess, getResultsOverview);
router.get("/teachers", directorAccess, getTeachersOverview);

export default router;
