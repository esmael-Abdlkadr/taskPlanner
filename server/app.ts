import express from "express";
import cors from "cors";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./src/routes/authRoute";
import workspaceRoutes from "./src/routes/workSpaceRoute";
import taskRoutes from "./src/routes/taskRoute";
import commentRoutes from "./src/routes/commentRoute";
import tagRoutes from "./src/routes/tagRoute";
import categoryRoutes from "./src/routes/categoryRoute";
import errorHandler from "./src/middleware/globalErrorHandler";
import swaggerSpec from "./swaggerOption";

const app = express();

// Simplified CORS configuration that works with curl and Swagger
app.use(cors({
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    environment: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api", taskRoutes);
app.use("/api", commentRoutes);
app.use("/api", tagRoutes);
app.use("/api", categoryRoutes);

app.use(errorHandler);

export default app;