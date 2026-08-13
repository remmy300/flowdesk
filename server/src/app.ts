import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { requireAuth } from "./middleware/auth.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", requireAuth, projectRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/comments", requireAuth, commentRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/uploads", requireAuth, uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
