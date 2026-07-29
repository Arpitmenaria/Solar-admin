import { io, type Socket } from "socket.io-client";

// Same backend socket.io server the main user-facing app connects to
// (kick-analyst-frontend/src/services/socket.js) — admin notifications are
// expected to ride the same server, joining an admin-only room server-side
// once authenticated. If the backend ends up standing up a separate admin
// socket server instead, only this URL needs to change.
const SOCKET_URL = "https://kick-analyst-backend-production.jay886631.workers.dev";

let socket: Socket | null = null;

export function connectAdminSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  return socket;
}

export function disconnectAdminSocket() {
  socket?.disconnect();
  socket = null;
}

export function getAdminSocket(): Socket | null {
  return socket;
}
