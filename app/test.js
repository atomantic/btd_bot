const _ = require('lodash')
const GTT = require('gdax-trading-toolkit')

const api = new GTT.Exchanges.GDAXExchangeAPI({
    auth: {
        key: process.env.GDAX_KEY,
        secret: process.env.GDAX_SECRET,
        passphrase: process.env.GDAX_PASS
    }
})

api.loadBalances().then(function(data) {
    console.log(data);
    for(id in data){
        console.log(id)
        _.map(data[id], function(bal, currency){
          console.log(currency, bal)
        })
    }
    process.exit(1);
})