// src/app.ts
import express, { Application } from "express";
import cors from "cors";
import binRoutes from "./routes/bin.routes";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "HookLens Engine" });
});

// Mount Routes
app.use("/api", binRoutes);

export default app;