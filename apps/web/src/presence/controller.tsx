"use client";

import {
  ClientUpdate,
  deserializeServerUpdate,
  serializeClientUpdate,
  ServerUpdate,
} from "net-utils";
import { usePathname } from "next/navigation";
import { memo, useEffect, useRef } from "react";
import useWebSocket, { ReadyState, SendMessage } from "react-use-websocket";
import { proxyMap } from "valtio/utils";
import { PresenceConnectionState, presenceState } from "./state";

function log(level: "info" | "error", ...args: unknown[]) {
  console[level](`[Presence]`, ...args);
}

function readyStateToConnectionState(
  readyState: ReadyState,
): PresenceConnectionState {
  switch (readyState) {
    case ReadyState.OPEN:
      return "connected";
    case ReadyState.CONNECTING:
      return "connecting";
    case ReadyState.CLOSING:
      return "disconnected";
    case ReadyState.CLOSED:
      return "disconnected";
    case ReadyState.UNINSTANTIATED:
      return "disconnected";
    default:
      throw new Error(`Invalid ready state: ${readyState}`);
  }
}

function sendClientUpdate(sendMessage: SendMessage, update: ClientUpdate) {
  sendMessage(serializeClientUpdate(update));
}

function handleServerUpdate(update: ServerUpdate) {
  if (update.myId !== null) {
    presenceState.myId = update.myId;
    log("info", "Client ID:", update.myId);
  }

  if (update.roomName !== null) {
    presenceState.roomName = update.roomName;
    log("info", "Joined room:", update.roomName);
  }

  if (update.clientCount !== null) {
    presenceState.clientCount = update.clientCount;
  }

  if (update.clientUpdates) {
    if (presenceState.clients === null) {
      presenceState.clients = proxyMap();
    }
    for (const clientUpdate of update.clientUpdates) {
      const existingClient = presenceState.clients.get(clientUpdate.id);
      if (existingClient) {
        existingClient.pointerXPercent = clientUpdate.pointerXPercent;
        existingClient.pointerYPercent = clientUpdate.pointerYPercent;
      } else {
        presenceState.clients.set(clientUpdate.id, {
          id: clientUpdate.id,
          pointerXPercent: clientUpdate.pointerXPercent,
          pointerYPercent: clientUpdate.pointerYPercent,
        });
      }
    }
  }

  if (update.removeClientIds && presenceState.clients) {
    for (const clientId of update.removeClientIds) {
      presenceState.clients.delete(clientId);
    }
  }
}

function getPointerPercent(
  pointer: { x: number; y: number },
  scroll: { x: number; y: number },
) {
  return {
    x: (pointer.x + scroll.x) / document.body.clientWidth,
    y: (pointer.y + scroll.y) / document.body.clientHeight,
  };
}

export const PresenceController = memo<{ serverUrl: string }>(
  ({ serverUrl }) => {
    const roomName = usePathname();

    const scrollRef = useRef<{ x: number; y: number } | null>(null);
    const pointerRef = useRef<{ x: number; y: number } | null>(null);

    const { sendMessage, readyState } = useWebSocket(serverUrl, {
      shouldReconnect: () => true,
      reconnectInterval: (lastAttemptNumber) => lastAttemptNumber * 1000,
      onOpen: () => {
        log("info", "Connected");
      },
      onClose: () => {
        presenceState.myId = null;
        presenceState.roomName = null;
        presenceState.clientCount = null;
        presenceState.clients = null;

        log("info", "Disconnected");
      },
      onError: (event) => {
        log("error", "Error:", event);
      },
      onMessage: async (event) => {
        let bytes;
        if (event.data instanceof ArrayBuffer) {
          bytes = new Uint8Array(event.data);
        } else if (event.data instanceof Blob) {
          bytes = new Uint8Array(await event.data.arrayBuffer());
        } else {
          return log("error", "Invalid message data type:", typeof event.data);
        }

        let update;
        try {
          update = deserializeServerUpdate(bytes);
        } catch (error) {
          return log("error", "Error deserializing server update:", error);
        }

        handleServerUpdate(update);
      },
    });

    const isConnected = readyState === ReadyState.OPEN;

    useEffect(() => {
      presenceState.connectionState = readyStateToConnectionState(readyState);
    }, [readyState]);

    useEffect(() => {
      if (!isConnected) {
        return;
      }

      sendClientUpdate(sendMessage, {
        roomName: roomName,
        pointerXPercent: null,
        pointerYPercent: null,
      });
    }, [sendMessage, isConnected, roomName]);

    useEffect(() => {
      if (!isConnected) {
        return;
      }

      const pointer = pointerRef.current;
      const scroll = scrollRef.current;
      if (!pointer || !scroll) {
        return;
      }

      const pointerPercent = getPointerPercent(pointer, scroll);
      sendClientUpdate(sendMessage, {
        roomName: null,
        pointerXPercent: pointerPercent.x,
        pointerYPercent: pointerPercent.y,
      });
    }, [sendMessage, isConnected, roomName]);

    useEffect(() => {
      const handleScroll = () => {
        scrollRef.current = { x: window.scrollX, y: window.scrollY };

        if (!isConnected) {
          return;
        }

        if (!pointerRef.current) {
          return;
        }
        const pointerPercent = getPointerPercent(
          pointerRef.current,
          scrollRef.current,
        );

        sendClientUpdate(sendMessage, {
          roomName: null,
          pointerXPercent: pointerPercent.x,
          pointerYPercent: pointerPercent.y,
        });
      };
      handleScroll();

      const handleMouseMove = (event: MouseEvent) => {
        scrollRef.current = { x: window.scrollX, y: window.scrollY };
        pointerRef.current = { x: event.clientX, y: event.clientY };

        if (!isConnected) {
          return;
        }

        const pointerPercent = getPointerPercent(
          pointerRef.current,
          scrollRef.current,
        );

        sendClientUpdate(sendMessage, {
          roomName: null,
          pointerXPercent: pointerPercent.x,
          pointerYPercent: pointerPercent.y,
        });
      };

      document.body.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("wheel", handleScroll);
      return () => {
        document.body.removeEventListener("mousemove", handleMouseMove);
        document.body.removeEventListener("wheel", handleScroll);
      };
    }, [sendMessage, isConnected]);

    return null;
  },
);
PresenceController.displayName = "PresenceController";
