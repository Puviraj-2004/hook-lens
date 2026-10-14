// src/config/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../services/redis.service";
import type { Request, Response, NextFunction } from "express";

// Max 60 requests per 1 minute per IP
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "hooklens:ratelimit",
});

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    res.status(429).json({
      success: false,
      message: "Too Many Requests. Free tier rate limit reached (60 req/min).",
    });
    return;
  }

  next();
};