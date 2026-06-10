// src/socket/socketEmitter.ts

import { getIO } from "./index";

interface NotificationPayload {
  id?: string;

  title: string;

  message: string;

  type: string;

  isRead?: boolean;

  createdAt: Date;
}

export const emitNotification = (
  agentId: string,
  notification: NotificationPayload
) => {

  const io = getIO();

  io.to(agentId).emit(
    "new-notification",
    notification
  );
};