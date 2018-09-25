var server = require("http").createServer();
var io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("createvertex", (v) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("createvertex", v);
    });
  });

  socket.on("createpolygon", (p) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("createpolygon", p);
    });
  });

  socket.on("deletevertex", (v) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("deletevertex", v);
    });
  });

  socket.on("updatevertex", (v) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("updatevertex", v);
    });
  });

  socket.on("updateobject", (o) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("updateobject", o);
    });
  });

  socket.on("deletepolygon", (p) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("deletepolygon", p);
    });
  });

  socket.on("createobject", (o) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("createobject", o);
    });
  });

  socket.on("deleteobject", (o) => {
    Object.keys(socket.rooms).map(r => {
      socket.broadcast.to(r).emit("deleteobject", o);
    });
  });

  socket.on("joinroom", (r) => {
    const clients = getClients(r);
    socket.join(r);

    if (clients.length > 0) {
      io.to(`${clients[0]}`).emit("requestlevel", `${socket.id}`);
    }
  });

  socket.on("responselevel", (l) => {
    io.to(`${l.clientId}`).emit("responselevel", l.level);
  });

});

function getClients(room) {
  let clients = [];
  if (!io.nsps['/'].adapter.rooms[room])
    return clients;
  else {
    Object.keys(io.nsps['/'].adapter.rooms[room].sockets).map(c => {
      clients.push(c);
    });
  }
  return clients;
}

server.listen(3123);