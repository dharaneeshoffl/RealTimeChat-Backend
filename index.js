import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Socket server running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  socket.on("join", (username) => {
    
    if (!username || users.some(u => u.id === socket.id)) return;

    console.log("JOIN:", username);

    users.push({
      id: socket.id,
      username: username.trim(),
    });

    io.emit("users", users.map(u => u.username));

    io.emit("message", {
      username: "System",
      message: `${username} joined the chat.`,
    });
  });

  socket.on("sendMessage", (data) => {
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    const user = users.find(u => u.id === socket.id);

    users = users.filter(u => u.id !== socket.id);

    io.emit("users", users.map(u => u.username));

    if (user) {
      io.emit("message", {
        username: "System",
        message: `${user.username} left the chat.`,
      });
    }

    console.log("DISCONNECTED:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server listening on", PORT);
});
