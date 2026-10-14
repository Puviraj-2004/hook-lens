// src/controllers/bin.controller.ts
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { redisService } from "../services/redis.service";
import { dbService } from "../services/db.service";
import { emitNewWebhook } from "../sockets/socket.handler";
import type { WebhookRequest } from "../types";

export class BinController {
  // 1. Create a new Unique Bin (Initial Guest bin in Redis)
  public static async createBin(req: Request, res: Response): Promise<void> {
    try {
      const binId = uuidv4();
      await redisService.createBin(binId);

      res.status(201).json({
        success: true,
        binId,
        endpoint: `/api/hook/${binId}`,
        isPermanent: false,
      });
    } catch (err) {
      console.error("createBin error:", err);
      res.status(500).json({ success: false, message: "Failed to initialize bin" });
    }
  }

  // 2. Claim / Save Bin Permanently (Moves to Neon Postgres)
  public static async claimBin(req: Request, res: Response): Promise<void> {
    try {
      const { binId } = req.params;
      const { name } = req.body;

      if (!binId || typeof binId !== "string") {
        res.status(400).json({ success: false, message: "Invalid bin ID" });
        return;
      }

      await dbService.claimBin(binId, name);

      // Backfill current Redis requests into Postgres
      const currentRequests = await redisService.getRequests(binId);
      for (const reqData of currentRequests) {
        await dbService.savePermanentRequest(reqData).catch(() => null);
      }

      res.status(200).json({
        success: true,
        message: "Endpoint saved permanently to database!",
        binId,
        isPermanent: true,
      });
    } catch (err) {
      console.error("claimBin error:", err);
      res.status(500).json({ success: false, message: "Failed to claim bin" });
    }
  }

  // 3. Catch Incoming Webhook (Dual Engine: Redis + Postgres if permanent)
  public static async catchWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { binId } = req.params;

      if (!binId || typeof binId !== "string") {
        res.status(400).json({ success: false, message: "Invalid bin ID" });
        return;
      }

      // Check if it exists in Redis or Postgres
      const inRedis = await redisService.binExists(binId);
      const isPermanent = await dbService.isPermanentBin(binId);

      if (!inRedis && !isPermanent) {
        res.status(404).json({ success: false, message: "Bin not found or expired" });
        return;
      }

      const newRequest: WebhookRequest = {
        id: uuidv4(),
        binId,
        method: req.method,
        headers: req.headers,
        query: req.query,
        body: req.body,
        ip: req.ip || req.socket.remoteAddress || "unknown",
        timestamp: new Date().toISOString(),
      };

      // 1. Always save to Redis for fast real-time access
      await redisService.saveRequest(binId, newRequest);

      // 2. If permanent, persist to Neon Postgres
      if (isPermanent) {
        await dbService.savePermanentRequest(newRequest);
      }

      // 3. Broadcast instantly via WebSocket
      emitNewWebhook(binId, newRequest);

      res.status(200).json({
        success: true,
        message: "Webhook received successfully",
      });
    } catch (err) {
      console.error("catchWebhook error:", err);
      res.status(500).json({ success: false, message: "Failed to process webhook" });
    }
  }

  // 4. Get Requests History (Checks Postgres first if permanent, else Redis)
  public static async getRequests(req: Request, res: Response): Promise<void> {
    try {
      const { binId } = req.params;

      if (!binId || typeof binId !== "string") {
        res.status(400).json({ success: false, message: "Invalid bin ID" });
        return;
      }

      const isPermanent = await dbService.isPermanentBin(binId);

      if (isPermanent) {
        const permanentRequests = await dbService.getPermanentRequests(binId);
        res.status(200).json({
          success: true,
          isPermanent: true,
          count: permanentRequests.length,
          data: permanentRequests,
        });
        return;
      }

      const inRedis = await redisService.binExists(binId);
      if (!inRedis) {
        res.status(404).json({ success: false, message: "Bin not found or expired" });
        return;
      }

      const requests = await redisService.getRequests(binId);
      res.status(200).json({
        success: true,
        isPermanent: false,
        count: requests.length,
        data: requests,
      });
    } catch (err) {
      console.error("getRequests error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
  }
}