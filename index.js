import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";

// createclient() creates a new Redis client instance. We create two clients: one for publishing messages and another for subscribing to messages.
// default redis connection is localhost:6379, if your redis server is running on a different host or port, you can specify it in the createClient() options.

const pub = createClient();
const sub = createClient();

await pub.connect();
await sub.connect();

const wss = new WebSocketServer({ port: 8080 });

await sub.subscribe("chat", (message) => {
  console.log("From Redis:", message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (data) => {
    const parsed = JSON.parse(data.toString());

    // const message = `${parsed.user}: ${parsed.text}`;
    const message = {
      user: parsed.user,
      text: parsed.text,
      timestamp: new Date().toISOString()
    };

    // Publish to Redis instead of direct broadcast
    await pub.publish("chat", JSON.stringify(message));

    // await pub.publish("chat", message);
  });
});