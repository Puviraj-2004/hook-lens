// src/controllers/bin.controller.ts
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { storageService } from "../services/storage.service";
import { emitNewWebhook } from "../sockets/socket.handler";
import { WebhookRequest } from "../types";

export class BinController {
  // 1. Create a new Unique Bin
  public static createBin(req: Request, res: Response): void {
    const binId = uuidv4();
    storageService.createBin(binId);

    res.status(201).json({
      success: true,
      binId,
      endpoint: `/api/hook/${binId}`,
    });
  }

  // 2. Catch the Incoming Webhook (Any HTTP method)
  public static catchWebhook(req: Request, res: Response): void {
    const { binId } = req.params;

    // Type Guard to ensure binId is purely a string
    if (!binId || typeof binId !== "string") {
      res.status(400).json({ success: false, message: "Invalid bin ID" });
      return;
    }

    if (!storageService.binExists(binId)) {
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

    // Save to storage
    storageService.saveRequest(binId, newRequest);

    // Broadcast instantly via WebSocket
    emitNewWebhook(binId, newRequest);

    res.status(200).json({
      success: true,
      message: "Webhook received successfully",
    });
  }

  // 3. Get past requests for this bin
  public static getRequests(req: Request, res: Response): void {
    const { binId } = req.params;

    // Type Guard
    if (!binId || typeof binId !== "string") {
      res.status(400).json({ success: false, message: "Invalid bin ID" });
      return;
    }

    if (!storageService.binExists(binId)) {
      res.status(404).json({ success: false, message: "Bin not found" });
      return;
    }

    const requests = storageService.getRequests(binId);
    res.status(200).json({ success: true, count: requests.length, data: requests });
  }
}