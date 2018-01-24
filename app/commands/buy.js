const argv = require('yargs').argv
const events = require('../lib/events')
const emoji = require('node-emoji')
// const service = require('../lib/gdax.client')
const market = require('../lib/market')
const log = require('../lib/log')
const bn = require('bignumber.js')
const buy = require('../lib/buy')
const pair2ticker = require('../lib/pair2ticker')
// const orderbooks = require('../lib/db.orderBookPairs')

// bootstrap accounts
const account = require('../lib/account')

let triggered = false

exports.command = 'buy'
exports.desc = emoji.get('robot_face') + ' buy the dip (place escalating order volumes at percentage drops from current price)'
exports.builder = {
    pair:{
      description: 'order pair, e.g ltcusd',
      default: 'ltcusd'
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
      description: 'percentage points to drop buy orders as it dips',
      default: 0.01
    },
    relative:{
      boolean: true,
      description: 'should the percentage of each order drop be of the current price or the last drop price? (true will make it so that each increasing order will be a percentage drop of the last order price)',
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
  let pair = argv.pair||'ltcusd'
  let percent = argv.percent||0.01
  let post = argv.post=='false' ? false : true
  let price = argv.price ? new bn(argv.price) : false
  let product_id = pair2ticker(pair)
  let orders = []
  let relative = argv.relative||true
  let total_cost = new bn(0)
  let total_vol = new bn(0)
  let vol_start = argv.start||0.01
  let vol_incr = argv.incr||0.01
  let vol_end = argv.end||0.1
  let buy_currency = pair.substr(0,3).toUpperCase()
  let sell_currency = pair.substr(3,3).toUpperCase()
  // can only submit orders with 5 decimals of precision in crypto on GDAX
  let sell_decimals = sell_currency==='USD' ? 2 : 5


  account.load()
//   orderbooks[pair].reload()

  // once the client API knows the price of the asset we want to trade:
  events.on('priceStart', function(data){
    if(!data || data.pair !== pair || !market[pair].priceStart){
        return
    }
    if(triggered){
      process.exit()
    }
    triggered = true
    let current_price = new bn(market[pair].priceStart)
    if(!price){
      // use latest price
      price = current_price
    }
    log.info(
        (post?'ordering':'mocking') +` ${product_id} ${vol_start} -> ${vol_end} (+${vol_incr}) at ${percent*100}% drops from price: ${price.toFixed(sell_decimals)}`
    )
    let percent_cost = price.times(percent)
    for(let i = new bn(vol_start);i.toNumber()<=vol_end; i = i.plus(vol_incr)){
      if(relative){
        // reset price drop to last price
        percent_cost = price.times(percent)
      }
      price = new bn(price.minus(percent_cost).toFixed(sell_decimals))
      total_vol = total_vol.plus(i)
      let total = price.times(i)
      total_cost = total_cost.plus(total)
      orders.push({
          price: price,
          size: i
      })
      console.log(
        i + '\t' + price.toFixed(sell_decimals)
      )
    }
    console.log('total cost:', total_cost.toFixed(sell_decimals), sell_currency)
    console.log('total vol:', total_vol.toFixed(sell_decimals), buy_currency)
    console.log('total drop:', (new bn(100) - price.dividedBy(current_price).times(100)).toFixed(2)+'%')
    console.log('total cost-basis (per 1 '+buy_currency+'):', total_cost.dividedBy(total_vol).toFixed(sell_decimals), buy_currency)
    
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
                buy(
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
