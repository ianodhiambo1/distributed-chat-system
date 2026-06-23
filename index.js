//@ts-nocheck 
import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";
import express from "express"
import indexRouter from "./auth/routers/indexRouter.js"
import signupRouter from "./auth/routers/signupRouter.js"

//Application Server
const SERVER_PORT = 3000

const app = express()

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use("/", indexRouter)


const server = app.listen(SERVER_PORT, () =>{
  console.log(`Server on ${SERVER_PORT}`)
})

//Redis Clients Publisher and Subscriber
// const pub = createClient();
// const sub = createClient();

// await pub.connect();
// await sub.connect();

// const wss = new WebSocketServer({ server: server });

// await sub.subscribe("chat", (message) => {
//   console.log("From Redis:", message);

//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(message);
//     }
//   });
// });

// wss.on("connection", (ws) => {
//   console.log("Client connected");

//   ws.on("message", async (data) => {
//     const parsed = JSON.parse(data.toString());

//     // const message = `${parsed.user}: ${parsed.text}`;
//     const message = {
//       user: parsed.user,
//       text: parsed.text,
//       timestamp: new Date().toISOString()
//     };

//     // Publish to Redis instead of direct broadcast
//     await pub.publish("chat", JSON.stringify(message));

//     // await pub.publish("chat", message);
//   });
// });

