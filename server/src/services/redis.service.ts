// src/services/redis.service.ts
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import type { WebhookRequest } from "../types";

dotenv.config();

// Initialize Serverless Upstash Redis Client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TTL_24_HOURS = 86400; // 24 hours in seconds

export class RedisService {
  // 1. Create a Bin with 24h Expiry
  public async createBin(binId: string): Promise<void> {
    const key = `bin:${binId}:meta`;
    // Store metadata with 24h expiry
    await redis.set(key, JSON.stringify({ createdAt: new Date().toISOString() }), {
      ex: TTL_24_HOURS,
    });
  }

  // 2. Check if Bin Exists and is not expired
  public async binExists(binId: string): Promise<boolean> {
    const key = `bin:${binId}:meta`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  // 3. Save incoming Webhook Request (Keep latest 50, auto-expire in 24h)
  public async saveRequest(binId: string, requestData: WebhookRequest): Promise<void> {
    const listKey = `bin:${binId}:requests`;

    // Push to the head of the Redis list (newest first)
    await redis.lpush(listKey, JSON.stringify(requestData));

    // Trim to keep only the latest 50 requests
    await redis.ltrim(listKey, 0, 49);

    // Refresh 24h expiry every time a request comes in
    await redis.expire(listKey, TTL_24_HOURS);
  }

  // 4. Get all requests for this bin
  public async getRequests(binId: string): Promise<WebhookRequest[]> {
    const listKey = `bin:${binId}:requests`;
    const items = await redis.lrange<string>(listKey, 0, 49);

    if (!items || items.length === 0) {
      return [];
    }

    // Parse stringified items back to WebhookRequest objects
    return items.map((item) => (typeof item === "string" ? JSON.parse(item) : item));
  }
}

export const redisService = new RedisService();