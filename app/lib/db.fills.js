const _ = require('lodash')
const events = require('./events')
const low = require('lowdb')
const lfs = require('lowdb/lib/file-async')
const db = low(__dirname+'/../data/db.fills.json', { storage: lfs })
// const log = require('./log')
const service = require('./gdax.client')

var fills = []

const getNextPage = function(args, cb){
  service.private.getFills(args, function(err, res, data){
    if(err) {
      console.error(fills.length)
      if(cb) cb(err)
    }
    console.log('fills this page: ', data.length, 'next: ', res.headers['cb-after'])
    fills = fills.concat(_.map(_.filter(data, {product_id: config.product_id}), function(o){
      // {
      //   "created_at": "2017-01-11T14:51:43.125Z",
      //   "trade_id": 12590574,
      //   "product_id": "BTC-USD",
      //   "order_id": "0fe0f14d-9c9e-4b91-9248-f70aefa31c55",
      //   "user_id": "516383ac0fe69a84f2000022",
      //   "profile_id": "da994f8d-7f10-4b5a-9d33-260a92e6453f",
      //   "liquidity": "M",
      //   "price": "812.01000000",
      //   "size": "0.20000000",
      //   "fee": "0.0000000000000000",
      //   "side": "buy",
      //   "settled": true
      // }
      return {
        "created_at": o.created_at,
        "order_id": o.order_id,
        "price": Number(o.price),
        "size": Number(o.size),
        "fee": Number(o.fee),
        "side": o.side
      }
    }))
    // const lastFillAlreadyIn = db.get('fills').find({trade_id: data[data.length-1].trade_id}).value()
    // console.log('found fill', lastFillAlreadyIn)
    if(data.length < 100){
      // last page or we already have this page and the previous in the local db
      db.set('fills', fills).value()
      console.log('number of fills: ', fills.length)
      setTimeout(function(){ // give lowdb time to write
        events.emit('sync.fills')
      }, 1000)
      return cb ? cb(err, fills) : false
    }

    getNextPage({
      after: res.headers['cb-after']
    }, cb)
  })
}


module.exports = {
  db: db.get('fills'),
  reload: function(cb){
    console.log('syncing fills db')
    fills = []
    getNextPage(null, cb)
  }
}
