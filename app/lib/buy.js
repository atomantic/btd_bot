const _ = require('lodash')
const account = require('./account')
const log = require('./log')
const service = require('./gdax.client')

module.exports = function(product_id, price, size, cb){
  cb = cb||_.noop

  const sell_currency = product_id.split('-')[1]
  const sell_currency_lower = sell_currency.toLowerCase()
  const price_decimals = sell_currency==='USD' ? 2 : 8
  const order_price = price*size

  if(size < 0.001){
    const err = 'size is too small ('+size+') must be > 0.001'
    log.fatal(err)
    return cb(err)
  }
  if(account.balance[sell_currency_lower+'Available'] - order_price <= 0){
    const err = 'insufficient '+sell_currency+': '+account.balance[sell_currency_lower+'Available']
    log.fatal(err)
    return cb(err)
  }
  const order = {
    type: 'order',
    productId: product_id,
    orderType: 'limit',
    side: 'buy',
    size: size.toNumber(),
    postOnly: true,
    price: price.toFixed(price_decimals)
  }
  // console.log('buy order', order)
  service.api.placeOrder(order).then(function(results){
    // console.log(results)
    account.balance[sell_currency_lower+'Available'] -= order_price
    cb(results)
  })
}
