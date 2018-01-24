const argv = require('yargs').argv
const events = require('../lib/events')
const emoji = require('node-emoji')
// const service = require('../lib/gdax.client')
const market = require('../lib/market')
const log = require('../lib/log')
const bn = require('bignumber.js')
const sell = require('../lib/sell')
const pair2ticker = require('../lib/pair2ticker')
// const orderbooks = require('../lib/db.orderBookPairs')

// bootstrap accounts
const account = require('../lib/account')

let triggered = false

exports.command = 'sell'
exports.desc = emoji.get('robot_face') + ' sell the pump (place escalating order volumes at percentage rises from current price)'
exports.builder = {
    pair:{
      description: 'order pair (ltcbtc, ethbtc, btcusd, etc)',
      default: 'ltcbtc'
    },
    start: {
      number: true,
      description: 'starting order size',
      default: 0.01
    },
    end:{
      number: true,
      description: 'ending order size',
      default: 0.1
    },
    exit:{
      boolean: true,
      description: 'exit process after running orders',
      default: false
    },
    incr:{
      number: true,
      description: 'increment rate for orders (e.g. 0.01 will increase volume by .01 each order until vol_end)',
      default: 0.01
    },
    percent:{
      number: true,
      description: 'percentage points to rise sell orders as it pumps',
      default: 0.01
    },
    relative:{
      boolean: true,
      description: 'should the percentage of each order rise be of the current price or the last rise price? (true will make it so that each increasing order will be a percentage rise of the last position)',
      default: true
    },
    post:{
      boolean: true,
      description: 'set to false to prevent posting orders',
      default: true
    },
    price:{
      description: 'starting price (if you want to specify instead of going off the current price)'
    }
}
exports.handler = function () {
  let exit = argv.exit=='true'||false
  let pair = argv.pair||'ltcbtc'
  let percent = argv.percent||0.01
  let post = argv.post=='false' ? false : true
  let price = argv.price ? new bn(argv.price) : false
  let product_id = pair2ticker(pair)
  let orders = []
  let relative = argv.relative||true
  let total_buy = new bn(0)
  let total_sell = new bn(0)
  let vol_start = argv.start||0.01
  let vol_incr = argv.incr||0.01
  let vol_end = argv.end||0.1
  let sell_currency = pair.substr(0,3).toUpperCase()
  let buy_currency = pair.substr(3,3).toUpperCase()
  // can only submit orders with 5 decimals of precision in crypto on GDAX
  let buy_decimals = buy_currency==='USD' ? 2 : 5
  let sell_decimals = sell_currency==='USD' ? 2 : 5

  account.load()

  // once the client API knows the price of the asset we want to trade:
  events.on('priceStart', function(data){
    if(!data || data.pair !== pair || !market[pair].priceStart){
        // failsafe
        return
    }
    if(triggered){
      // double failsafe
      process.exit()
    }
    // console.log(exit,pair,percent,post,price,product_id,relative,sell_currency,buy_decimals,buy_currency)
    // proccess.exit()
    // return
    triggered = true
    let current_price = new bn(market[pair].priceStart)
    if(!price){
      // use latest price
      price = current_price
    }
    log.info(
        (post?'ordering':'mocking') +` ${product_id} ${vol_start} -> ${vol_end} (+${vol_incr}) at ${percent*100}% pumps from price: ${price.toFixed(buy_decimals)}`
    )
    let percent_cost = price.times(percent)
    for(let i = new bn(vol_start);i.toNumber()<=vol_end; i = i.plus(vol_incr)){
      if(relative){
        // reset price drop to last price
        percent_cost = price.times(percent)
      }
      price = new bn(price.plus(percent_cost).toFixed(buy_decimals))
      total_sell = total_sell.plus(i)
      let total = price.times(i)
      total_buy = total_buy.plus(total)
      orders.push({
          price: price,
          size: i
      })
    }
    // reverse order log for spreadsheet
    for(var j=orders.length-1; j>=0; j-- ){
        console.log(
            orders[j].size + '\t' + orders[j].price.toFixed(buy_decimals)
        )
    }
    console.log('total buy:', total_buy.toFixed(buy_decimals), buy_currency)
    console.log('total sell:', total_sell.toFixed(sell_decimals), sell_currency)
    console.log('total pump:', (new bn(100) - current_price.dividedBy(price).times(100)).toFixed(2)+'%')
    console.log('total sell-basis (per 1 '+sell_currency+'):', total_buy.dividedBy(total_sell).toFixed(buy_decimals), buy_currency)
    
    if(post){
        console.log('posting orders')
        let orderIndex = 0
        let orderNext = function(/*results*/){
            // if(results) console.log('order sent', results)
            if(orderIndex===orders.length){
                console.log('all orders posted')
                if(exit){
                    process.exit()
                }
            }else{
                let order = orders[orderIndex]
                orderIndex++
                sell(
                    product_id, 
                    order.price, 
                    order.size, 
                    orderNext
                )
            }
        }
        orderNext()
    }else{
        console.log('skipping post (just mock/testing)')
        if(exit){
            process.exit()
        }
    }
  })
}
