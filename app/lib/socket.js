const socketIO = require('socket.io')
const socket = {
  io: {},
  connectionTriggers:{},
  init: function(server){
    return socket.io = socketIO(server)
  },
  all: function(name, data){
    if(!socket.io.emit){
      // not implemented
      return
    }
    // alert all connected now
    socket.io.emit(name, data)
    // send to any new connections
    // only add event once per trigger name
    if(!socket.connectionTriggers[name]){
      socket.io.on('connection', function(socket){
        socket.emit(name, data)
      })
      socket.connectionTriggers[name] = true
    }
  }
}
module.exports = socket
