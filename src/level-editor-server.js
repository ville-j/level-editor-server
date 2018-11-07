const server = require("http").createServer();
const Room = require("./room.js");
const io = require("socket.io")(server);

class LevelEditorServer {
  constructor(settings) {
    this.init(settings);
  }
  init(settings) {
    const defaultSettings = {
      port: 3123,
      roomCleanupTime: 60
    };
    this.settings = { ...defaultSettings, ...settings };
    this.rooms = [];

    setInterval(() => {
      this.roomCleanup();
    }, 1000 * this.settings.roomCleanupTime);

    io.on("connection", socket => {
      socket.on("createvertex", v => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("createvertex", v);
        });
      });
      socket.on("createpolygon", p => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("createpolygon", p);
        });
      });
      socket.on("deletevertex", v => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("deletevertex", v);
        });
      });
      socket.on("updatevertex", v => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("updatevertex", v);
        });
      });
      socket.on("updateobject", o => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("updateobject", o);
        });
      });
      socket.on("deletepolygon", p => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("deletepolygon", p);
        });
      });
      socket.on("createobject", o => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("createobject", o);
        });
      });
      socket.on("deleteobject", o => {
        Object.keys(socket.rooms).map(r => {
          socket.broadcast.to(r).emit("deleteobject", o);
        });
      });
      socket.on("joinroom", r => {
        try {
          const clients = this.getClients(r.name);
          this.joinRoom(r.name, r.password, socket);

          if (clients.length > 0) {
            io.to(`${clients[0]}`).emit("requestlevel", `${socket.id}`);
          }
        } catch (e) {
          console.log(e);
        }
      });
      socket.on("responselevel", l => {
        io.to(`${l.clientId}`).emit("responselevel", l.level);
      });
      socket.on("listrooms", () => {
        socket.emit("listrooms", this.listRooms());
      });
    });
  }
  listRooms() {
    return this.rooms.filter(r => !r.unlisted).map(r => r.name);
  }
  start() {
    server.listen(this.settings.port);
    console.log(`server running on port ${this.settings.port}`);
  }
  createRoom(name, password, unlisted) {
    const existing = this.rooms.find(r => r.name === name);

    if (existing) throw "room already exists";

    const r = new Room(name, password, unlisted);
    this.rooms.push(r);
    this.emitRooms();
    return r;
  }
  emitRooms() {
    io.sockets.emit("listrooms", this.listRooms());
  }
  joinRoom(roomName, password, socket) {
    let er = this.rooms.find(r => r.name === roomName);

    if (!er) er = this.createRoom(roomName, password, false);
    if (password !== er.password) throw "wrong password";

    Object.keys(socket.rooms).map(r => {
      if (r !== socket.id) {
        socket.leave(r);
      }
    });
    socket.join(er.name);
  }
  getClients(room) {
    let clients = [];
    if (!io.nsps["/"].adapter.rooms[room]) return clients;
    else {
      Object.keys(io.nsps["/"].adapter.rooms[room].sockets).map(c => {
        clients.push(c);
      });
    }
    return clients;
  }
  roomCleanup() {
    const emptyRooms = this.rooms.filter(r => {
      return this.getClients(r.name).length < 1;
    });
    emptyRooms.forEach(r => {
      const i = this.rooms.findIndex(f => {
        return f.name === r.name;
      });
      this.rooms.splice(i, 1);
    });
    emptyRooms.length > 0 && this.emitRooms();
  }
}

module.exports = LevelEditorServer;
