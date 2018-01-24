[Coinbase]: https://www.coinbase.com/join/antic

# Buy the Dip Bot (BTD Bot)

This is my own automated daemon for monitoring [Coinbase][Coinbase] prices and using my own API key to buy/sell bitcoin.
This is extremely experimental and not meant to act as a financial tool for others (though you are welcome to fork and experiment).
Currently, I am building up the simulator, which will create a report based on my strategy to show whether it works or not over a sample time in bitcoin market price history.

I am not a financial advisor, nor am I a professional market trader, nor a certified data scientist. Usage of this tool and data is entirely at your own risk.

# Setup

* Get a [Coinbase GDAX][Coinbase] API key/secret
* Set `GDAX_KEY`, `GDAX_SECRET`, `GDAX_PASS` as env vars
* setup a [GDAX](https://www.gdax.com) account (Login with Coinbase OAuth)
* install node (recommend using [NVM](https://github.com/creationix/nvm))
* Setup Google APIs for Spreadsheet access (followin instructions here: https://github.com/theoephraim/node-google-spreadsheet)
* Run `pm2 start process.yml`
* navigate to http://localhost:3117

# Historical Data
Historical Market data (this is the price between the buy/sell price, which otherwise includes fees) is maintained in `./data/history.json`. This is the source of test data used for `sim` mode, which will use the decider to churn over the known history of market data and report profit/loss.
History can be updated by running `node . sync` to get current market data. [Coinbase][Coinbase] limits the number of days and hours that the API will report on so there is also a watch mode that runs constantly to save significant market data to the history file.

## Watch Mode
The current market price can be watched by running `node . sync -w` -- this will check the market price every 30 seconds(configured as `watch_interval` in `config.js` and overridable with `--interval=n` where `n` is milliseconds) and append the data to `./data/history.json`, thereby creating more accurate and realtime simulation data. Only significant changes (2% change) to the last recorded market price will be saved as we will never act on a change percentage of less than 2% (so any changes to market data that are less than 2% to the last recorded change are just noise and simulation values that will always be ignored).

# Strategy
A general strategy for market trading is the old adage "buy low, sell high"
In a free market, with no fees, this can be done ad-nauseum, with no penalty wherein even the slightest change in the market can be a profitable exchange.
However, like all other market trading engine, [Coinbase][Coinbase] charges a transaction fee.
The fee is 1% and applies both to a buy action and to a sell action, which means a series of `buy@a`+`sell@b`+`buy@c`+`sell@d` will result in roughly a 4% fee (.01a + .01b + .01c + .01d)--since these prices should be fluctuating it's not actually a flat 4% on one price but an additive percentage based on each transaction amount.

This means that a simple "buy low, sell high" strategy that always runs whenever prices change will result in a gradual depletion of the funds from both `US$` and `BTC` accounts. To make a `buy`-`sell`-`buy`-`sell` combination equitable over time for the investor, I propose a daemon that watches prices and only takes a `buy`/`sell` action if the rate has shifted a certain percentage from the last `buy`/`sell` action. Additionally, the % drop/rise triggers to buy sell are managed as different thresholds so the system will drive the accounts toward either a growth in $ or BTC.

It's worth noting that the fees impose a minimum market rate change limit percentage of 2% for a series of actions to be equitable for the investor.

## Examples
The following examples assume that the investor is starting with a BTC balance of `0` and a US$ balance of `$1,000`

### Consistent 1% change

|BTC Price|BTC Change|Action|Quantity|Fee|$ Change|BTC|$|
|---|---|---|---|---|---|---|---|
|$668.00|0|buy|1|$6.68|-$674.68|1|$25.32|
|$674.68|1%|sell|-1|-$6.75|$667.93|0|$693.25|
|$667.93|-1%|buy|1|$6.68|-$674.61|1|$18.64|
|$674.61|1%|sell|-1|-$6.75|$667.87|0|$686.51|

As you can see, buying and selling on 1% change in either direction would lose money over time, even with stable ups and downs. Volatile ups and downs would simply hide the fact that you are doing so poorly until the volatility reversed and the accounts are suddenly depleted.
This holds true all the way up to 2% change (accounting for 1% fee in both directions)

### Consistent 3% change

|BTC Price|BTC Change|Action|Quantity|Fee|$ Change|BTC|$|
|---|---|---|---|---|---|---|---|
|$668.00|0|buy|1|$6.68|-$674.68|1|$325.32|
|$688.04|3%|sell|-1|-$6.88|$681.16|0|$1,006.48|
|$667.40|-3%|buy|1|$6.67|-$674.07|1|$332.41|
|$687.42|3%|sell|-1|-$6.87|$680.55|0|$1,012.95|

Any investment over 2% change will result in a net gain, if the market continuously rebalances and takes you back to your beginning investment point (possibly over a long period of time).

# Limited Resources
It is a common problem in investing that the investor does not have infinite financial resources to pump into the system. This poses a problem with any automated strategy as the investing source balance will likely not allow continuously buying as the market drops, unless the investment amounts per transaction are reduced to account for the possibility that the investment will drop by the buy change percentage continuously until the investment market value reaches zero (or until it reaches an amount where the investor would prefer to abandon the investment, preventing throwing good money after bad).
For this reason, the system will take the configured `change_buy` value and calculate the number of drops the current market price can take at that rate. It will then take the configured starting US $ amount and divide it up to determine a recommended BTC `buy`/`sell` volume.

For example, if an investor only has `$1,000` to invest and the BTC market price is $668 per BTC, the investor will not have the flexibility to respond to the market at whole BTC volume exchanges. If the investor buys and sells .01BTC each transaction, then each transaction will change the investment source by ~$6.68, giving the investor more leg room for ups and downs in the market.btc.

# Transaction Frequency and Value
Additionally, it is worth noting that the closer to 2% the transaction threshold is configured, the more frequently trades will be made, and the less profitable transactions will be in the long term.

The higher the percentage of change needed to take action on the market, the more profit will be made, however, the investor will miss out on many triggers to profit.

This is a careful balancing act that requires simulation and configuration and possibly detailed human intervention until enough automation is in place.

## Author

Adam Eivy is a software architect by day and a drawing dad by night. Check out his latest project [Beetle Royale](http://beetleroyale.com) or [follow him on the interwebs](http://adameivy.com)

[![gratipay](https://img.shields.io/gratipay/antic.svg?style=flat)](https://gratipay.com/antic)

![follow](https://img.shields.io/twitter/follow/antic.svg?style=social&label=Follow)

[![](https://www.coinbase.com/assets/buttons/donation_small-c2401ae30dd0ad6018deadfc4bb506bf56b5b7062738ee449bee97c4e80ec70c.png)](https://www.coinbase.com/checkouts/62b15a45f11194f8555884e200024616)

## modify gdax node client

add this to websocketclient under:
self.socket.send(JSON.stringify(subscribeMessage));
```
self.socket.send(JSON.stringify({
  type: 'heartbeat',
  on: true
  })
);
```

# Algorithm

## Spread Sweeper

1. get 24 hour stats
2. place a buy and sell orders at those prices (high and low)

# Profit Reporting Spreadsheet
```
cd app
node cli.js spreadsheet
open fills.xlsx
```


# Examples

```
node cli.js buy --pair=ltcbtc --start=1 --end=20 --incr=1 --percent=.03 --exit=true --post=false

# LTC-USD - daily
node cli.js buy --pair=ltcusd --start=.01 --end=1 --incr=.05 --percent=.02 --exit=true --post=false

# ETH-USD - daily
node cli.js buy --pair=ethusd --start=.01 --end=1 --incr=.05 --percent=.02 --exit=true --post=false
node cli.js buy --pair=ethusd --start=.1 --end=1 --incr=.1 --percent=.04 --exit=true --post=false


node cli.js buy --pair=btcusd --start=.01 --end=.39 --incr=.02 --percent=.02 --exit=true --post=false



# ETH-BTC
node cli.js buy --pair=ethbtc --start=.03 --end=.6 --incr=.02 --percent=.01 --exit=true --post=false 
node cli.js sell --pair=ethbtc --start=.01 --end=.6 --incr=.02 --percent=.01 --exit=true --post=false
```