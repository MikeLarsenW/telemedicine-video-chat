const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");

app.set("view engine", "ejs");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});
const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    console.log("Joining room");
    socket.join(roomId);

    socket.on('connection-request',(roomId,userId)=>{
      io.to(roomId).emit('new-user-connected',userId);
      console.log("connection request received.");
    });
    
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

httpServer.listen(process.env.PORT || 4000);
