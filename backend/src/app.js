import express from "express";
import cors from "cors";
import { rateLimit } from "./middleware/rateLimit.js";
import adminRoutes from "./routes/admin.routes.js";
import registrarRoutes from "./routes/registrar.routes.js";
import directorRoutes from "./routes/director.routes.js";
import viceDirectorRoutes from "./routes/viceDirector.routes.js";
import academicYearRoutes from "./routes/academicYear.routes.js";
import classRoutes from "./routes/class.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import teacherAuthRoutes from "./routes/teacherAuth.routes.js";
import studentAuthRoutes from "./routes/studentAuth.routes.js";
import teachingAssignmentRoutes from "./routes/teachingAssignment.routes.js";
import assessmentSchemeRoutes from "./routes/assessmentScheme.routes.js";
import studentRoutes from "./routes/student.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import promotionBatchRoutes from "./routes/promotionBatch.routes.js";
import markRoutes from "./routes/mark.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import resultRoutes from "./routes/result.routes.js";
import rankingRoutes from "./routes/ranking.routes.js";
import streamRoutes from "./routes/stream.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Rate limit all login endpoints
app.use("/api/admin/login", rateLimit);
app.use("/api/registrar/login", rateLimit);
app.use("/api/director/login", rateLimit);
app.use("/api/vice-director/login", rateLimit);
app.use("/api/teacher-auth/login", rateLimit);
app.use("/api/student-auth/login", rateLimit);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "High School Management API Running",
  });
});

// Admin routes
app.use("/api/admin", adminRoutes);

// Registrar routes
app.use("/api/registrar", registrarRoutes);

// Director routes
app.use("/api/director", directorRoutes);

// Vice Director routes
app.use("/api/vice-director", viceDirectorRoutes);

// Academic year routes
app.use("/api/academic-years", academicYearRoutes);

// Class routes
app.use("/api/classes", classRoutes);

// Subject routes
app.use("/api/subjects", subjectRoutes);

// Teacher routes
app.use("/api/teachers", teacherRoutes);

// Teacher auth routes
app.use("/api/teacher-auth", teacherAuthRoutes);

// Student auth routes
app.use("/api/student-auth", studentAuthRoutes);

// Teaching assignment routes
app.use("/api/teaching-assignments", teachingAssignmentRoutes);

// Assessment scheme routes
app.use("/api/assessment-schemes", assessmentSchemeRoutes);

// Student routes
app.use("/api/students", studentRoutes);

// Promotion routes
app.use("/api/promotion", promotionRoutes);

// Mark routes
app.use("/api/marks", markRoutes);

// Review routes
app.use("/api/review", reviewRoutes);

// Result routes
app.use("/api/results", resultRoutes);

// Ranking routes
app.use("/api/ranking", rankingRoutes);

// Stream routes
app.use("/api/stream", streamRoutes);

// Approval routes
app.use("/api/approval", approvalRoutes);

// Promotion batch routes
app.use("/api/promotion-batch", promotionBatchRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

export default app;