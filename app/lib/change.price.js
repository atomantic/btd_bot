const market = require('./market')
const ticker2pair = require('./ticker2pair')
const dbOrderBookPairs = require('./db.orderBookPairs')
const events = require('./events')
const log = require('./log')
var lastPrice = 0
module.exports = function(product_id, price) {
  var pair = ticker2pair(product_id)
  const marketIcon = price < market[pair].price ? '⬇ ' : '⬆ '
  market[pair].price = price

  if(!market[pair].priceStart){
    market[pair].priceStart = price
    // if(pair==='ltcbtc'){
    //   console.log('change.price', product_id, pair, price)
    // }
    events.emit('priceStart', {
      product_id: product_id,
      pair: pair,
      price: price
    })
  }
  events.emit('price', {
    product_id: product_id,
    pair: pair,
    price: price
  })
  // only log if it changed since last run
  if(price===lastPrice){
    return
  }
  lastPrice = price
  const dbOrders = dbOrderBookPairs[pair]
  const nearestBuy = dbOrders.db.filter({side:'buy'}).maxBy('price').value()
  const nearestSell = dbOrders.db.filter({side:'sell'}).minBy('price').value()
  // map orders to simplified price output object
  const prices = []
  if(nearestBuy){
    prices.push({
      icon: '💰 ',
      size: nearestBuy.size,
      price: nearestBuy.price
    })
  }
  prices.push({
    icon: marketIcon,
    price: price
  })
  if(nearestSell){
    prices.push({
      icon: '🏷 ',
      size: nearestSell.size,
      price: nearestSell.price
    })
  }
  // log.debug(JSON.stringify(nearestBuy))

  log.info(product_id, ':', dbOrders.db.size().value() + ' orders: ' + prices.reduce(function(sum, o){
    return (sum ? sum + ' | ' : '') + o.icon + ' '+ (o.size ? o.size + '@' : '') + o.price
  }, ''))

  log.balances()

}
