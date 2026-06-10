// src/socket/socketEvents.ts

import { Server } from "socket.io";

export const registerSocketEvents = (
  io: Server
) => {

  io.on("connection", (socket) => {

    console.log(
      "Client connected:",
      socket.id
    );

    /* =========================
       JOIN AGENT ROOM
    ========================= */
    socket.on(
      "join-agent-room",
      (agentId: string) => {

        socket.join(agentId);

        console.log(
          `Agent joined room: ${agentId}`
        );
      }
    );

    socket.on("disconnect", () => {

      console.log(
        "Client disconnected:",
        socket.id
      );
    });
  });
};