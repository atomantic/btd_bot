// process exception listeners to exit proc
// (allows pm2 or docker restart on websocket failure, etc)
// require('./lib/process')

// 3rd party libs
const async = require('async')
const Hapi = require('hapi')
const Inert = require('inert')

// my libs
const clui = require('./clui')
const service = require('./lib/gdax.client')

const account = require('./lib/account')
const events = require('./lib/events')
// const config = require('./config')
// const getTicker = require('./lib/get.ticker')
const log = require('./lib/log')
// const ordersDB = require('./lib/db.orders')
// bootstrap gdax service components
const socket = require('./lib/socket')
// const fs = require('fs')
const server = new Hapi.Server()
server.connection({ port: 3117, host: 'localhost' })
const io = socket.init(server.listener)

events.on('balance', log.balances)
events.on('price', function(data){
  log.balances(account)
  // log.debug(data.pair, data.price)
})
account.load()

io.on('connection', function (socket) {
  socket.emit('status', 'connected')
  // socket.emit('orders', ordersDB.db.value())
})

// service.websocket.on('message', function(data){
//   if(!data || data.type==='received' || data.reason==='canceled'){
//     return;
//   }
//   if(data.type==='done' && data.reason==='filled' && data.price){
//     return io.emit('message.done', data)
//   }
//   //return io.emit('message.other', data)
// })

server.register(Inert, () => {})

  
// })
server.start((err) => {
  if (err) throw err
  const now = new Date().toLocaleString()
  log.info(`\\[._.]/ - running at: ${server.info.uri} on ${now}`)
  // require('./engine/spread')()
  // require('./engine/escalate')('ETH-BTC')
  require('./engine/escalate')('LTC-BTC')
})

module.exports = server
