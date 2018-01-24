const _ = require('lodash')
const Table = require('cli-table')
const market = require('../market')

module.exports = function(account){
  if(!account){
    return;
  }
  const b = account.balance
  const btcusdPrice = Number(market.btcusd.price)
  const ltcusdPrice = Number(market.ltcusd.price)
  const ethusdPrice = Number(market.ethusd.price)
  const btcLiquid = b.btc * btcusdPrice
  const ltcLiquid = b.ltc * ltcusdPrice
  const ethLiquid = b.eth * ethusdPrice
  const headers = [
    'USD: $'+b.usd.toFixed(2),
    'BTC@ $'+btcusdPrice.toFixed(2)+' = $'+btcLiquid.toFixed(2),
    'ETH@ $'+ethusdPrice.toFixed(2)+' = $'+ethLiquid.toFixed(2),
    'LTC@ $'+ltcusdPrice.toFixed(2)+' = $'+ltcLiquid.toFixed(2),
    'Liquid $'
  ]
  const data = [[
    b.usdAvailable.toFixed(2) +' / '+ b.usd.toFixed(2),
    b.btcAvailable.toFixed(8) +' / '+ b.btc,
    b.ethAvailable.toFixed(8) +' / '+ b.eth,
    b.ltcAvailable.toFixed(8) +' / '+ b.ltc,
    (b.usd.toNumber() + btcLiquid + ltcLiquid + ethLiquid).toFixed(2)
    // !b.price ? 'unknown' : b.usd + b.btc*b.price,
    // !b.priceStart ? 'unknown' : b.usd + b.btc*b.priceStart
  ]]
  const colWidths = [24,    40,    34,    34,    16]
  const table = new Table({head: headers, colWidths: colWidths})
  // table is an Array, so you can `push`, `unshift`, `splice` and friends
  _.forEach(data, function(row){
      table.push(row)
  })
  console.log(table.toString())
}
