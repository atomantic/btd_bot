const argv = require('yargs').argv
const events = require('../lib/events')
const emoji = require('node-emoji')
const market = require('../lib/market')
const log = require('../lib/log')
const bn = require('bignumber.js')
const buy = require('../lib/buy')
const pair2ticker = require('../lib/pair2ticker')

// bootstrap accounts
const account = require('../lib/account')

let triggered = false
exports.command = 'dca'
exports.desc = emoji.get('robot_face') + ' Dollar Cost Average buyer: Creates orders at intervals with a given dollar cost (e.g. node . dca --pair=btcusd --cost=100 --percent=.01 --times=12; this will set 12 buy orders at 1% drops for $100 worth of BTC at each spot price)'
exports.builder = {
    pair:{
      description: 'order pair, e.g btcusd',
      default: 'btcusd'
    },
    cost: {
      number: true,
      description: 'dollar cost for each order',
      default: 100
    },
    times:{
      number: true,
      description: 'number of orders to place',
      default: 5
    },
    exit:{
      boolean: true,
      description: 'exit process after running orders',
      default: false
    },
    percent:{
      number: true,
      description: 'percentage points to drop buy orders as it dips',
      default: 0.01
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
  let pair = argv.pair||'btcusd'
  let cost = new bn(argv.cost||100)
  let percent = argv.percent||0.01
  let times = argv.times||5
  let post = argv.post=='false' ? false : true
  let product_id = pair2ticker(pair)
  let orders = []
  let price = argv.price ? new bn(argv.price) : false
  let total_cost = new bn(0)
  let total_vol = new bn(0)
  let buy_currency = pair.substr(0,3).toUpperCase()
  let sell_currency = pair.substr(3,3).toUpperCase()
  // can only submit orders with 5 decimals of precision in crypto on GDAX
  let sell_decimals = sell_currency==='USD' ? 2 : 5
  let buy_decimals = buy_currency==='USD' ? 2 : 5

  account.load()
//   orderbooks[pair].reload()

  // once the client API knows the price of the asset we want to trade:
  events.on('priceStart', function(data){
    //   console.log('priceStart', data, data.pair, pair, market[pair].priceStart)
    if(!data || data.pair !== pair || !market[pair].priceStart){
        console.log('waiting...')
        return
    }
    if(triggered){
      console.log('already triggered')
      process.exit()
    }
    triggered = true
    let current_price = new bn(market[pair].priceStart)
    if(!price){
      // use latest price
      price = current_price
    }
    log.info(
        (post?'ordering':'mocking') +` ${product_id} ${times} orders of ${cost} @ ${percent*100}% drops from price: ${price.toFixed(sell_decimals)}`
    )
    // for each order want to place
    for(let i=0;i<times;i++){
      // get the price at -percent
      price = new bn(price.minus(price.times(percent)).toFixed(sell_decimals))
      // get the volume to order (based on cost)
      let volume = new bn(cost.dividedBy(price)).toFixed(buy_decimals)
    //   log.info(price, volume)
      total_vol = total_vol.plus(volume)
      let total = price.times(volume)
      total_cost = total_cost.plus(total)
      orders.push({
          price: price,
          size: new bn(volume)
      })
      console.log(
        volume + '\t' + price.toFixed(sell_decimals)
      )
    }
    console.log('total cost:', total_cost.toFixed(sell_decimals), sell_currency)
    console.log('total vol:', total_vol.toFixed(sell_decimals), buy_currency)
    console.log('total cost-basis (per 1 '+buy_currency+'):', total_cost.dividedBy(total_vol).toFixed(sell_decimals), buy_currency)
    
    // console.log(orders)
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
