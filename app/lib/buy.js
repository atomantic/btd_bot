const _ = require('lodash')
const account = require('./account')
const log = require('./log')
const service = require('./gdax.client')

module.exports = function(product_id, price, size, cb){
  cb = cb||_.noop

  let sell_currency = product_id.split('-')[1]
  let sell_currency_lower = sell_currency.toLowerCase()
  let price_decimals = sell_currency==='USD' ? 2 : 8

  if(size < 0.001){
    const err = 'size is too small ('+size+') must be > 0.001'
    log.fatal(err)
    return cb(err)
  }
  if(account.balance[sell_currency_lower+'Available'] - (price*size) <= 0){
    const err = 'insufficient '+sell_currency
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
    account.balance[sell_currency_lower+'Available'] -= (price*size)
    cb(results)
  })
}
