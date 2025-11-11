import type { Logger } from "pino";
import type { WebSocket } from "uWebSockets.js";

export type ClientWebSocket = WebSocket<ClientData>;

export type ClientData = {
  id: number;
  logger: Logger;
  roomName: string | null;
  pointerXPercent: number | null;
  pointerYPercent: number | null;
};

let lastClientId = 0;

export function nextClientId() {
  if (lastClientId >= 65_535) {
    lastClientId = 0;
  }
  return lastClientId++;
}
