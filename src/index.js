var server = require("http").createServer();
var io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("createvertex", (v) => {
    socket.broadcast.emit("createvertex", v);
  });

  socket.on("createpolygon", (p) => {
    socket.broadcast.emit("createpolygon", p);
  });

  socket.on("deletevertex", (v) => {
    socket.broadcast.emit("deletevertex", v);
  });

  socket.on("updatevertex", (v) => {
    socket.broadcast.emit("updatevertex", v);
  });

  socket.on("updateobject", (o) => {
    socket.broadcast.emit("updateobject", o);
  });

  socket.on("deletepolygon", (p) => {
    socket.broadcast.emit("deletepolygon", p);
  });

});

server.listen(3123);