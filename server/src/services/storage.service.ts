// src/services/storage.service.ts
import { WebhookRequest } from "../types";

class StorageService {
  // Key: binId, Value: Array of WebhookRequests
  private bins: Map<string, WebhookRequest[]> = new Map();

  public createBin(binId: string): void {
    if (!this.bins.has(binId)) {
      this.bins.set(binId, []);
    }
  }

  public binExists(binId: string): boolean {
    return this.bins.has(binId);
  }

  public saveRequest(binId: string, requestData: WebhookRequest): void {
    const existing = this.bins.get(binId) || [];
    // Keep only the latest 50 requests per bin (Memory safety)
    if (existing.length >= 50) {
      existing.pop();
    }
    // Newest on top
    this.bins.set(binId, [requestData, ...existing]);
  }

  public getRequests(binId: string): WebhookRequest[] {
    return this.bins.get(binId) || [];
  }
}

export const storageService = new StorageService();