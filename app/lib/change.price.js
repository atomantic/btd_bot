const market = require('./market')
const ticker2pair = require('./ticker2pair')
const events = require('./events')
// const log = require('./log')
// var lastPrice = 0
module.exports = function(product_id, price) {
  var pair = ticker2pair(product_id)
  // const marketIcon = price < market[pair].price ? '⬇ ' : '⬆ '
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

  // log.balances()

}
