import { proxy, useSnapshot } from "valtio";

export type PresenceConnectionState =
  | "disconnected"
  | "connecting"
  | "connected";

export type ClientState = {
  id: number;
  pointerXPercent: number | null;
  pointerYPercent: number | null;
};

export type PresenceState = {
  connectionState: PresenceConnectionState;
  myId: number | null;
  roomName: string | null;
  clientCount: number | null;
  clients: Map<number, ClientState> | null;
};

export const presenceState = proxy<PresenceState>({
  connectionState: "disconnected",
  myId: null,
  roomName: null,
  clientCount: null,
  clients: null,
});

export function usePresenceState() {
  return useSnapshot(presenceState);
}
