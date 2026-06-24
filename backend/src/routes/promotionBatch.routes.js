import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import { runPromotion } from "../controllers/promotionBatch.controller.js";

const router = express.Router();

router.use(authAdmin);

// RUN YEAR-END PROMOTION
router.post("/run", runPromotion);

export default router;
