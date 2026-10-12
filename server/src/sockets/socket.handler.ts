// src/sockets/socket.handler.ts
import { Server as SocketIOServer, Socket } from "socket.io";
import { WebhookRequest } from "../types";

let io: SocketIOServer | null = null;

export const initSocket = (socketServer: SocketIOServer): void => {
  io = socketServer;

  io.on("connection", (socket: Socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // Join room corresponding to their binId
    socket.on("join-bin", (binId: string) => {
      socket.join(binId);
      console.log(`📌 Socket ${socket.id} joined room: ${binId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

// Function to emit incoming webhook to the room
export const emitNewWebhook = (binId: string, data: WebhookRequest): void => {
  if (io) {
    io.to(binId).emit("new-webhook", data);
  }
};