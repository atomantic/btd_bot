const log = require('./log')

process.on('uncaughtException', function(err){
  log.fatal(err, err.stack)

    var stack = new Error().stack
console.log( stack )
  process.exit(1)
})

process.on('unhandledRejection', function(reason, p) {
  log.error("Unhandled Rejection at: Promise ", p, " reason: ", reason)
})

const signals = {
  'SIGINT': 2,
  'SIGTERM': 15
}
function shutdown(signal, value) {
  log.info(signal+'['+value+'] recieved, shutting down...')
  // TODO: create final report
  // cancel orders?
  log.fatal('exiting process')
  process.exit(128 + value)
}

Object.keys(signals).forEach(function (signal) {
  // console.log('registered handler for ', signal)
  process.on(signal, function () {
    // console.log('signal', signal)
    shutdown(signal, signals[signal])
  })
})
