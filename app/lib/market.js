pairs = ['btcusd','bchusd','ethusd','ethbtc','ltcusd','ltcbtc']
const market = {}
pairs.map( function(pair){
  market[pair] = {
    ask: 0,
    bid: 0,
    price: 0,
    priceStart: 0,
    spread: 0
  }
})
module.exports = market
