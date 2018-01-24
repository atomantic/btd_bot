module.exports = function(pair){
    ticker = pair.toUpperCase()
    ticker = ticker.substr(0,3) + '-' + ticker.substr(3,3)
    return ticker
  }
  