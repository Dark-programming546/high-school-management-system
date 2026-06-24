import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import { assignStream } from "../controllers/stream.controller.js";

const router = express.Router();

router.use(authAdmin);

// assign NATURAL or SOCIAL
router.post("/assign/:studentId", assignStream);

export default router;
