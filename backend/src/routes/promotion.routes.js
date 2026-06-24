import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import { promote, checkStudent } from "../controllers/promotion.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/promote/:studentId", promote);
router.get("/check/:studentId", checkStudent);

export default router;
