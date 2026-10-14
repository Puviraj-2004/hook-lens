// src/services/db.service.ts
import { PrismaClient } from "@prisma/client";
import type { WebhookRequest } from "../types";

export const prisma = new PrismaClient();

export class DatabaseService {
  // 1. Check if bin is marked as permanent in Postgres
  public async isPermanentBin(binId: string): Promise<boolean> {
    const bin = await prisma.bin.findUnique({
      where: { id: binId },
    });
    return Boolean(bin?.isPermanent);
  }

  // 2. Claim / Save a Bin permanently
  public async claimBin(binId: string, name?: string): Promise<void> {
    await prisma.bin.upsert({
      where: { id: binId },
      update: {
        isPermanent: true,
        name: name || "Saved Bin",
      },
      create: {
        id: binId,
        name: name || "Saved Bin",
        isPermanent: true,
      },
    });
  }

  // 3. Save incoming webhook record permanently to Neon Postgres
  public async savePermanentRequest(requestData: WebhookRequest): Promise<void> {
    try {
      await prisma.webhookRecord.create({
        data: {
          id: requestData.id,
          binId: requestData.binId,
          method: requestData.method,
          headers: requestData.headers as object,
          query: requestData.query as object,
          // Safe JSON handling: if no body, set to undefined so Prisma makes it DB NULL
          body:
            requestData.body !== undefined && requestData.body !== null
              ? (requestData.body as object)
              : undefined,
          ip: requestData.ip,
          timestamp: new Date(requestData.timestamp),
        },
      });
      console.log(`💾 Saved permanently to Neon Postgres: ${requestData.id}`);
    } catch (err) {
      console.error("❌ Prisma savePermanentRequest failed:", err);
    }
  }

  // 4. Fetch historical requests from Postgres
  public async getPermanentRequests(binId: string): Promise<WebhookRequest[]> {
    const records = await prisma.webhookRecord.findMany({
      where: { binId },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return records.map((r) => ({
      id: r.id,
      binId: r.binId,
      method: r.method,
      headers: r.headers as any,
      query: r.query as any,
      body: r.body,
      ip: r.ip,
      timestamp: r.timestamp.toISOString(),
    }));
  }
}

export const dbService = new DatabaseService();