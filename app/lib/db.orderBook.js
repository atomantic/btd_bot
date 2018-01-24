/* generic order database class for each trading pair */
const _ = require('lodash')
const argv = require('yargs').argv
const events = require('./events')
const fs = require('fs')
const log = require('./log')
const low = require('lowdb')
const lfs = require('lowdb/lib/file-async')
const service = require('./gdax.client')

module.exports = function(product_id){
  const pair = product_id.toLowerCase().replace('-','')
  const dbFile = __dirname+`/../data/db.orders.${pair}.json`
  if(!fs.existsSync(dbFile)){
    fs.writeFileSync(dbFile, JSON.stringify({
      "orders": []
    }))
  }
  const db = low(dbFile, { storage: lfs })
  var orders = []
  const dbObj = {
    name: pair,
    db: db.get('orders'),
    reload: function(cb){
      log.action('load orders', pair, product_id)
      orders = []
      service.api.loadAllOrders(product_id).then(function(data){
        console.log(data)
        // {
        //   "price": "0",
        //   "size": "3",
        //   "side": "sell",
        //   "id": "a6868bf3-76ff-4102-9e90-f2048eaec8b0",
        //   "time": "2017-11-12T03:02:36.925Z",
        //   "productId": "LTC-BTC",
        //   "status": "open",
        //   "extra": {
        //     "id": "a6868bf3-76ff-4102-9e90-f2048eaec8b0",
        //     "price": "0.01550000",
        //     "size": "3.00000000",
        //     "product_id": "LTC-BTC",
        //     "side": "sell",
        //     "stp": "dc",
        //     "type": "limit",
        //     "time_in_force": "GTC",
        //     "post_only": true,
        //     "created_at": "2017-11-12T03:02:36.925329Z",
        //     "fill_fees": "0.0000000000000000",
        //     "filled_size": "0.00000000",
        //     "executed_value": "0.0000000000000000",
        //     "status": "open",
        //     "settled": false
        //   }
        // }
        orders = orders.concat(_.map(
          data,
          function(o){
            return {
                "filled_size": o.extra.filled_size,
                "id": o.id,
                "price": o.extra.price,
                "side": o.side,
                "size": o.extra.size,
                "time": o.time
            }
          }
        ))
        db.set('orders', orders).value()
        log.success('orders loaded: ', orders.length)
        setTimeout(function(){ // give lowdb time to write
          events.emit('sync.orders')
        }, 1000)
        return cb ? cb(err, orders) : false
      }).catch((err) => {
        throw(err.message)
      })
    }
  }
  return dbObj
}
