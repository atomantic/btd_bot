const dbOrderBook = require('./db.orderBook')
module.exports = {
  'btcusd': dbOrderBook('BTC-USD'),
  'bchusd': dbOrderBook('BCH-USD'),
  'ethbtc': dbOrderBook('ETH-BTC'),
  'ethusd': dbOrderBook('ETH-USD'),
  'ltcbtc': dbOrderBook('LTC-BTC'),
  'ltcusd': dbOrderBook('LTC-USD')
}