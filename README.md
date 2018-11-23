[Coinbase]: https://www.coinbase.com/join/antic

# Buy the Dip Bot (BTD Bot)

This is my own automated daemon for monitoring [Coinbase][Coinbase] prices and using my own API key to buy/sell bitcoin.
This is extremely experimental and not meant to act as a financial tool for others (though you are welcome to fork and experiment).
Currently, I am building up the simulator, which will create a report based on my strategy to show whether it works or not over a sample time in bitcoin market price history.

I am not a financial advisor, nor am I a professional market trader, nor a certified data scientist. Usage of this tool and data is entirely at your own risk.

# Setup

* setup a [Coinbase Pro](https://pro.coinbase.com) account
* Get a [Coinbase Pro][Coinbase] API key/secret
* Set `GDAX_KEY`, `GDAX_SECRET`, `GDAX_PASS` as env vars
* install node (recommend using [NVM](https://github.com/creationix/nvm))

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
node cli.js sell --pair=ethbtc --start=.01 --end=.5 --incr=.01 --percent=.03 --exit=true --post=false
```

## Daily buys
```
# BTCUSD
node cli.js buy --pair=bchusd --start=.01 --end=.01 --incr=0 --percent=.01 --exit=true --post=true
# ETHUSD
node cli.js buy --pair=ltcusd --start=.01 --end=.01 --incr=0 --percent=.01 --exit=true --post=true
# LTCUSD
node cli.js buy --pair=ltcusd --start=.1 --end=.01 --incr=0 --percent=.01 --exit=true --post=true
```


## Dollar Cost Average buys

You may wish to buy a given dollar value at percentage drop points. For example, you may wish to buy $100 worth of Bitcoin at 1% drops from the current price.
```
# BTCUSD
node cli.js dca --pair=btcusd --cost=100 --times=10 --percent=.01 --exit=true --post=false
```

# Limited Resources
It is a common problem in investing that the investor does not have infinite financial resources to pump into the system. This poses a problem with any automated strategy as the investing source balance will likely not allow continuously buying as the market drops, unless the investment amounts per transaction are reduced to account for the possibility that the investment will drop by the buy change percentage continuously until the investment market value reaches zero (or until it reaches an amount where the investor would prefer to abandon the investment, preventing throwing good money after bad).
For this reason, the system will take the configured `change_buy` value and calculate the number of drops the current market price can take at that rate. It will then take the configured starting US $ amount and divide it up to determine a recommended BTC `buy`/`sell` volume.

For example, if an investor only has `$1,000` to invest and the BTC market price is $668 per BTC, the investor will not have the flexibility to respond to the market at whole BTC volume exchanges. If the investor buys and sells .01BTC each transaction, then each transaction will change the investment source by ~$6.68, giving the investor more leg room for ups and downs in the market.

# Transaction Frequency and Value
Additionally, it is worth noting that the closer to 2% the transaction threshold is configured, the more frequently trades will be made, and the less profitable transactions will be in the long term.

The higher the percentage of change needed to take action on the market, the more profit will be made, however, the investor will miss out on many triggers to profit.

This is a careful balancing act that requires simulation and configuration and possibly detailed human intervention until enough automation is in place.

## Author

Adam Eivy is a software architect by day and a drawing dad by night. Check out his latest project [Beetle Royale](http://beetleroyale.com) or [follow him on the interwebs](http://adameivy.com)

[![gratipay](https://img.shields.io/gratipay/antic.svg?style=flat)](https://gratipay.com/antic)

![follow](https://img.shields.io/twitter/follow/antic.svg?style=social&label=Follow)

[![](https://www.coinbase.com/assets/buttons/donation_small-c2401ae30dd0ad6018deadfc4bb506bf56b5b7062738ee449bee97c4e80ec70c.png)](https://www.coinbase.com/checkouts/62b15a45f11194f8555884e200024616)
