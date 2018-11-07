const LevelEditorServer = require("./level-editor-server.js");
const server = new LevelEditorServer({
  port: 3123,
  roomCleanupTime: 10
});
server.start();
