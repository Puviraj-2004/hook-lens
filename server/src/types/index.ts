// src/types/index.ts

export interface WebhookRequest {
  id: string;
  binId: string;
  method: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  body: any;
  ip: string;
  timestamp: string;
}

export interface Bin {
  id: string;
  createdAt: string;
}