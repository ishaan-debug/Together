import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@together/shared";

import { config } from "./config.js";

const app = express();
app.use(cors({ origin: config.corsOrigin }));

app.get("/", (_req, res) => {
  res.send("Running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

const server = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: config.corsOrigin, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  // Known issue (roadmap 1.4): this notifies every connected user, not just the call partner.
  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", ({ to, signal }) => {
    io.to(to).emit("callAccepted", signal);
  });
});

server.listen(config.port, () => {
  console.log(`Signaling server listening on port ${config.port}`);
});
