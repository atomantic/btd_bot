const EventEmitter = require('events')
class MyEmitter extends EventEmitter {}

module.exports = new MyEmitter()
