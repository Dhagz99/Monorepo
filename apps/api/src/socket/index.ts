// src/socket/index.ts

import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initializeSocket = (
  server: http.Server,
  allowedOrigins: string[]
) => {

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  return io;
};

export const getIO = () => {

  if (!io) {
    throw new Error(
      "Socket.io not initialized"
    );
  }

  return io;
};