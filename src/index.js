const LevelEditorServer = require('./level-editor-server.js')
const server = new LevelEditorServer({
  port: 3123
})
server.start()
