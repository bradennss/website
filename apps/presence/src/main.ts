import assert from "assert";
import {
  deserializeClientUpdate,
  serializeServerUpdate,
  type ServerUpdate,
} from "net-utils";
import pino from "pino";
import {
  App,
  type HttpRequest,
  type HttpResponse,
  type TemplatedApp,
  type us_socket_context_t,
} from "uWebSockets.js";
import { nextClientId, type ClientData, type ClientWebSocket } from "./client";
import { env } from "./env";

const ROOM_NAME_TOPIC = (roomName: string) => `room:${roomName}`;

function sendServerUpdate(ws: ClientWebSocket, update: ServerUpdate) {
  ws.send(serializeServerUpdate(update), true);
}
function publishServerUpdate(
  app: TemplatedApp,
  topic: string,
  update: ServerUpdate,
) {
  app.publish(topic, serializeServerUpdate(update), true);
}

function main() {
  const logger = pino({ name: "presence", level: "info" });

  logger.info("Starting...");

  const clients = new Map<number, ClientData>();
  const clientsByRoom = new Map<string, Set<ClientData>>();

  function addClient(ws: ClientWebSocket, client: ClientData) {
    clients.set(client.id, client);

    sendServerUpdate(ws, {
      myId: client.id,
      roomName: null,
      clientCount: clients.size,
      clientUpdates: null,
      removeClientIds: null,
    });
  }

  function removeClient(
    ws: ClientWebSocket,
    client: ClientData,
    isClosing?: boolean,
  ) {
    if (client.roomName !== null) {
      removeClientFromRoom(ws, client, isClosing);
    }

    clients.delete(client.id);
  }

  function setClientRoom(
    ws: ClientWebSocket,
    client: ClientData,
    roomName: string,
  ) {
    if (client.roomName !== null) {
      removeClientFromRoom(ws, client);
    }

    const clients = clientsByRoom.get(roomName) ?? new Set();

    clients.add(client);
    clientsByRoom.set(roomName, clients);
    client.roomName = roomName;

    ws.subscribe(ROOM_NAME_TOPIC(roomName));
    sendServerUpdate(ws, {
      myId: null,
      roomName: roomName,
      clientCount: clients.size,
      clientUpdates: Array.from(clients.values()).map((c) => ({
        id: c.id,
        pointerXPercent: c.pointerXPercent,
        pointerYPercent: c.pointerYPercent,
      })),
      removeClientIds: null,
    });

    client.logger.info(`Added to room ${roomName}`);
  }

  function removeClientFromRoom(
    ws: ClientWebSocket,
    client: ClientData,
    isClosing = false,
  ) {
    const roomName = client.roomName;
    assert(roomName !== null, "Client is not in a room");

    const roomClients = clientsByRoom.get(roomName);
    assert(roomClients !== undefined, `Room ${roomName} not found`);

    const removedClientIds = Uint32Array.from(
      Array.from(roomClients.values()).map((c) => c.id),
    );
    if (!isClosing) {
      sendServerUpdate(ws, {
        myId: null,
        roomName: null,
        clientCount: 0,
        clientUpdates: null,
        removeClientIds: removedClientIds,
      });
    }

    roomClients.delete(client);

    if (!isClosing) {
      ws.unsubscribe(ROOM_NAME_TOPIC(roomName));
    }

    // Sent after room clients are updated so new count is accurate.
    publishServerUpdate(app, ROOM_NAME_TOPIC(roomName), {
      myId: null,
      roomName: null,
      clientCount: roomClients.size,
      clientUpdates: null,
      removeClientIds: Uint32Array.from([client.id]),
    });

    if (roomClients.size === 0) {
      clientsByRoom.delete(roomName);
    }
    client.roomName = null;

    client.logger.info(`Removed from room ${roomName}`);
  }

  function handleUpgrade(
    res: HttpResponse,
    req: HttpRequest,
    context: us_socket_context_t,
  ) {
    const id = nextClientId();
    const clientLogger = logger.child({ clientId: id });

    clientLogger.info("Handling upgrade...");

    const data: ClientData = {
      id,
      logger: clientLogger,
      roomName: null,
      pointerXPercent: null,
      pointerYPercent: null,
    };

    res.upgrade(
      data,
      req.getHeader("sec-websocket-key"),
      req.getHeader("sec-websocket-protocol"),
      req.getHeader("sec-websocket-extensions"),
      context,
    );
  }

  function handleOpen(ws: ClientWebSocket) {
    const data = ws.getUserData();

    addClient(ws, data);

    data.logger.info("Connected");
  }

  function handleClose(ws: ClientWebSocket) {
    const data = ws.getUserData();

    removeClient(ws, data, true);

    data.logger.info("Disconnected");
  }

  function handleMessage(
    ws: ClientWebSocket,
    message: ArrayBuffer,
    isBinary: boolean,
  ) {
    const client = ws.getUserData();

    if (!isBinary) {
      client.logger.warn("Sent non-binary message, closing...");
      return ws.close();
    }
    let update;
    try {
      update = deserializeClientUpdate(new Uint8Array(message));
    } catch (error) {
      client.logger.warn("Sent invalid message, closing...");
      return ws.close();
    }

    if (update.roomName !== null && update.roomName !== client.roomName) {
      setClientRoom(ws, client, update.roomName);
    }
    if (update.pointerXPercent !== null || update.pointerYPercent !== null) {
      if (update.pointerXPercent !== null) {
        client.pointerXPercent = update.pointerXPercent;
      }
      if (update.pointerYPercent !== null) {
        client.pointerYPercent = update.pointerYPercent;
      }

      if (client.roomName !== null) {
        publishServerUpdate(app, ROOM_NAME_TOPIC(client.roomName), {
          myId: null,
          roomName: null,
          clientCount: null,
          clientUpdates: [
            {
              id: client.id,
              pointerXPercent: client.pointerXPercent,
              pointerYPercent: client.pointerYPercent,
            },
          ],
          removeClientIds: null,
        });
      }
    }
  }

  const app = App({})
    .get("/", (res) => {
      res.writeStatus("200 OK");
      res.end("OK");
    })
    .ws("/", {
      idleTimeout: 60,
      upgrade: handleUpgrade,
      open: handleOpen,
      close: handleClose,
      message: handleMessage,
    });

  app.listen(env.HOST, env.PORT, () => {
    logger.info(`Server is running on ${env.HOST}:${env.PORT}`);
  });

  async function handleShutdown() {
    logger.info("Shutting down...");
    app.close();
    process.exit(0);
  }
  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
}

main();
