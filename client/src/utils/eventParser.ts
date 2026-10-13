// client/src/utils/eventParser.ts
import type { WebhookRequest } from "../types";

export interface ParsedEvent {
  provider: "GitHub" | "Stripe" | "Browser" | "Custom";
  eventType: string;
  sender: string;
  target: string;
  badgeColor: string;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

export function parseEvent(req: WebhookRequest): ParsedEvent {
  const headers = req.headers;
  const body = req.body;

  // 1. GitHub Detection (checks header 'x-github-event')
  const githubEvent = headers["x-github-event"];
  if (githubEvent && typeof githubEvent === "string") {
    let sender = "GitHub User";
    let target = "Repository";

    if (isRecord(body)) {
      if (isRecord(body.sender) && typeof body.sender.login === "string") {
        sender = `@${body.sender.login}`;
      }
      if (isRecord(body.repository) && typeof body.repository.name === "string") {
        target = body.repository.name;
      }
    }

    return {
      provider: "GitHub",
      eventType: githubEvent.toUpperCase(),
      sender,
      target,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    };
  }

  // 2. Stripe Detection (checks header 'stripe-signature' or body.type)
  const isStripe =
    Boolean(headers["stripe-signature"]) ||
    (isRecord(body) && typeof body.type === "string" && body.type.includes("."));

  if (isStripe && isRecord(body) && typeof body.type === "string") {
    let sender = "Stripe Customer";
    let target = "Charge";

    if (isRecord(body.data) && isRecord(body.data.object)) {
      const obj = body.data.object;
      if (typeof obj.customer === "string") sender = obj.customer;
      if (typeof obj.amount === "number") target = `${obj.amount / 100} ${String(obj.currency || "").toUpperCase()}`;
    }

    return {
      provider: "Stripe",
      eventType: body.type,
      sender,
      target,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    };
  }

  // 3. Browser Direct Visit Detection
  const userAgent = String(headers["user-agent"] || "");
  const isBrowser =
    req.method === "GET" &&
    (headers.accept ? String(headers.accept).includes("text/html") : false) &&
    (userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari"));

  if (isBrowser) {
    return {
      provider: "Browser",
      eventType: "PAGE VISIT",
      sender: "Web Browser",
      target: req.query && Object.keys(req.query).length > 0 ? "With Params" : "Direct Hit",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    };
  }

  // 4. Fallback / Custom API Client (Postman, curl, custom backend)
  let sender = "API Client";
  if (userAgent.includes("Postman")) sender = "Postman";
  if (userAgent.includes("curl")) sender = "cURL";

  return {
    provider: "Custom",
    eventType: req.method,
    sender,
    target: `/api/hook/${req.binId.slice(0, 8)}...`,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };
}