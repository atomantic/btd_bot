const _ = require('lodash')
const account = require('./account')
const log = require('./log')
const service = require('./gdax.client')

module.exports = function(product_id, price, size, cb){
  cb = cb||_.noop

  const sell_currency = product_id.split('-')[0]
  const sell_currency_lower = sell_currency.toLowerCase()
  const price_decimals = sell_currency==='USD' ? 2 : 8
  const available = account.balance[sell_currency_lower+'Available']
  const new_available = available - size
  // log.info(product_id, price, size, price_total)

  if(size < 0.001){
    const err = 'size is too small ('+size+') must be > 0.001'
    log.fatal(err)
    return cb(err)
  }
  if( new_available <= 0){
    const err = 'insufficient '+sell_currency+': '+available+' - '+size + ' = ' + new_available
    log.fatal(err)
    return cb(err)
  }
  const order = {
    type: 'order',
    productId: product_id,
    orderType: 'limit',
    side: 'sell',
    size: size.toNumber(),
    postOnly: true,
    price: price.toFixed(price_decimals)
  }
  // console.log('sell order', order)
  service.api.placeOrder(order).then(function(results){
    account.balance[sell_currency_lower+'Available'] -= size
    cb(results)
  })
}
