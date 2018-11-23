const GTT = require('gdax-trading-toolkit')
const changePrice = require('./change.price')
const log = require('./log')
const logger = log.gtt
const books = {
  ltcbtc: null
}
// const products = ['LTC-USD', 'BCH-USD', 'BCH-BTC', 'BTC-USD', 'BTC-LTC', 'BTC-ETH', 'ETH-USD']
// const products = ['LTC-USD', 'BCH-USD', 'BTC-USD', 'LTC-BTC', 'ETH-USD', 'ETH-BTC']
const products = ['BTC-USD']

GTT.Factories.GDAX.FeedFactory(logger, products).then((feed) => {
    feed.on('data', (msg) => {
      if(msg.type==='ticker'){
        // if(msg.productId==='LTC-BTC') console.log(msg.productId, msg.price)
        changePrice(msg.productId, msg.price)
      }
  })
}).catch((err) => {
  throw(err.message)
})

module.exports = {
  books: books,
  GTT: GTT,
  api: new GTT.Exchanges.GDAXExchangeAPI({
    auth: {
      key: process.env.GDAX_KEY,
      secret: process.env.GDAX_SECRET,
      passphrase: process.env.GDAX_PASS
    }
  }),
  logger: logger,
  products: products
}
