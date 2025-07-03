const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId) || new Set();
  return Array.from(room).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
};

const codeStore = {};
io.on("connection", (socket) => {
  console.log("A new client connected " + " " + socket.id);

  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    console.log(clients);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    console.log("Received code-change from", socket.id, "for room", roomId);
    codeStore[roomId] = code;
    socket.in(roomId).emit("code-change", { code });
  });
  socket.on("sync-code", ({ socketId, roomId }) => {
    const code = codeStore[roomId] || "";
    io.to(socketId).emit("sync-code-response", {
      code,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
  // console.log(userSocketMap);
});

const port = process.env.port || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
