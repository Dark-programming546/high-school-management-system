import express from "express";

import authAdmin from "../middleware/authAdmin.js";
import {
  createClass,
  getClasses,
  updateClass,
  deleteClass,
  assignClassBoss,
  removeClassBoss,
} from "../controllers/class.controller.js";

const router = express.Router();

router.use(authAdmin);

router.post("/", createClass);
router.get("/", getClasses);
router.patch("/:id/class-boss", assignClassBoss);
router.patch("/:id/remove-class-boss", removeClassBoss);
router.patch("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
