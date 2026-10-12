// client/src/types/index.ts

export type HttpHeaders = Record<string, string | string[] | undefined>;
export type HttpQuery = Record<string, string | string[] | undefined>;

export interface WebhookRequest {
  id: string;
  binId: string;
  method: string;
  headers: HttpHeaders;
  query: HttpQuery;
  body: unknown;
  ip: string;
  timestamp: string;
}