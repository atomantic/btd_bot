const _ = require('lodash')
const service = require('./gdax.client')
const events = require('./events')
const log = require('./log')
const socket = require('./socket')
const account = {
  id: null,
  balance: {
    usd: 0,
    usdAvailable: 0,
    btc: 0,
    btcAvailable: 0,
    bch: 0,
    bchAvailable: 0,
    eth: 0,
    ethAvailable: 0,
    ltc: 0,
    ltcAvailable: 0
  },
  load: function(cb) {
    log.action('load accounts')
    service.api.loadBalances().then(function(data) {
      console.log('balance', data)
      for(var id in data){
        _.map(data[id], function(bal, currency){
          account.id = id
          let lower = currency.toLowerCase()
          account.balance[lower] = bal.balance
          account.balance[lower+'Available'] = bal.available
        })
      }
      account.loaded = true
      events.emit('balance', account)
      // fire to clients
      socket.all('balance', account.balance)
      log.success('accounts loaded')
      if(cb) cb(null, data)
    }).catch(function(err){
      log.fatal(err)
    })
  },
  loaded: false
}

module.exports = account
