import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import eventRouter from "./routers/event.js";
import businessRouter from "./routers/business.js";
import userRoutes from "./routers/user.js";
import postRoutes from "./routers/post.js";
import chatRoutes from "./routers/chat.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: "15mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: true }));
app.use(cors());
app.use("/events", eventRouter);
app.use("/businesses", businessRouter);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);

app.get("/", (req, res) => res.send("Geo Events API"));

const PORT = process.env.PORT || 5000;
const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT || 5500;

let server = app.listen(SOCKET_IO_PORT, () => {
  console.log("Socket.io server running on port :" + SOCKET_IO_PORT);
});

const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

mongoose
  .connect(process.env.CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port : ${PORT}`))
  )
  .catch((error) => console.log(error.message));

// socket.io
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const deleteUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    deleteUser(socket.id);
    io.emit("getUsers", users);
  });
});
