// src/routes/bin.routes.ts
import { Router } from "express";
import { BinController } from "../controllers/bin.controller";

const router = Router();

// Create new bin
router.post("/bins", BinController.createBin);

// Fetch history of a bin
router.get("/bins/:binId/requests", BinController.getRequests);

// Catch ANY HTTP verb (POST, GET, PUT, DELETE, PATCH) for webhooks
router.all("/hook/:binId", BinController.catchWebhook);

export default router;