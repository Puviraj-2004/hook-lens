// src/server.ts
import http from "http";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { initSocket } from "./sockets/socket.handler";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

initSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 HookLens Engine is running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready to accept incoming connections`);
});