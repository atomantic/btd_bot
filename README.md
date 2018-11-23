[Coinbase]: https://www.coinbase.com/join/antic

# Buy the Dip Bot (BTD Bot)

This is my own automated daemon for monitoring [Coinbase][Coinbase] prices and using my own API key to buy/sell bitcoin.
This is extremely experimental and not meant to act as a financial tool for others (though you are welcome to fork and experiment).
Currently, I am building up the simulator, which will create a report based on my strategy to show whether it works or not over a sample time in bitcoin market price history.

I am not a financial advisor, nor am I a professional market trader, nor a certified data scientist. Usage of this tool and data is entirely at your own risk.

> This is also a hodgepodge of code from an older bitcoin trading bot that I was working on which is currently unpublished. Some of the libraries and edges might show.

# Setup

* setup a [Coinbase Pro](https://pro.coinbase.com) account
* Get a [Coinbase Pro][Coinbase] API key/secret
* Set `GDAX_KEY`, `GDAX_SECRET`, `GDAX_PASS` as env vars
* install node (recommend using [NVM](https://github.com/creationix/nvm))

# Examples

![](demo.png)

```
# BTC-USD
node cli.js buy --pair=btcusd --start=.01 --end=.1 --incr=.01 --percent=.02 --exit=true --post=false

# LTC-USD
node cli.js buy --pair=ltcusd --start=.01 --end=1 --incr=.05 --percent=.02 --exit=true --post=false

# ETH-USD
node cli.js buy --pair=ethusd --start=.1 --end=1 --incr=.1 --percent=.04 --exit=true --post=false

# LTC-BTC
node cli.js buy --pair=ltcbtc --start=1 --end=10 --incr=1 --percent=.01 --exit=true --post=false 
```

## Daily buys
```
# BTCUSD
node cli.js buy --pair=btcusd --start=.01 --end=.01 --incr=0 --percent=.01 --exit=true --post=true
# ETHUSD
node cli.js buy --pair=ethusd --start=.01 --end=.01 --incr=0 --percent=.01 --exit=true --post=true
# LTCUSD
node cli.js buy --pair=ltcusd --start=.1 --end=.01 --incr=0 --percent=.01 --exit=true --post=true
```


## Dollar Cost Average buys

You may wish to buy a given dollar value at percentage drop points. For example, you may wish to buy $100 worth of Bitcoin at 1% drops from the current price.
```
# BTCUSD
node cli.js dca --pair=btcusd --cost=100 --times=10 --percent=.01 --exit=true --post=false
```

## Author

Adam Eivy is a software architect by day and a drawing dad by night. Check out his latest project [Beetle Royale](http://beetleroyale.com) or [follow him on the interwebs](http://adameivy.com)

![follow](https://img.shields.io/twitter/follow/antic.svg?style=social&label=Follow)

[![](https://www.coinbase.com/assets/buttons/donation_small-c2401ae30dd0ad6018deadfc4bb506bf56b5b7062738ee449bee97c4e80ec70c.png)](https://www.coinbase.com/checkouts/62b15a45f11194f8555884e200024616)
