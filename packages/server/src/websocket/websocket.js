import { WebSocketServer } from "ws";

export class SchedulerWebSocketServer {
  constructor(httpServer) {
    this.wss = new WebSocketServer({
      server: httpServer,
      path: "/ws",
    });

    this.wss.on("connection", (socket) => {
      console.log("WebSocket client connected");

      socket.send(
        JSON.stringify({
          type: "connection:ready",
          payload: {
            message: "Connected to placement scheduler",
          },
        }),
      );

      socket.on("close", () => {
        console.log("WebSocket client disconnected");
      });
    });
  }

  broadcast(type, payload) {
    const message = JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  }
}
