// src/routes/bin.routes.ts
import { Router } from "express";
import { BinController } from "../controllers/bin.controller";
import { rateLimitMiddleware } from "../config/ratelimit";

const router = Router();

// Create new temporary bin
router.post("/bins", BinController.createBin);

// Claim / Save bin permanently to Neon Postgres
router.post("/bins/:binId/claim", BinController.claimBin);

// Fetch history of a bin
router.get("/bins/:binId/requests", BinController.getRequests);

// Catch ANY HTTP verb for webhooks with Upstash Rate Limiting
router.all("/hook/:binId", rateLimitMiddleware, BinController.catchWebhook);

export default router;