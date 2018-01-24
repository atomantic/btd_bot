// working with decimal numbers sucks in javascript
// normally, I'd recommend turning all decimal values into integers but this is funky
// with 2 digit USD and 8 digit BTC (and GDAX responds with nothing but strings)
// so we have to convert to safe strings and numbers
// lest we do operations like 850.81 + .01 => 850.8199999999999
// so we safety it with fixString(850.81 + .01, 2) => "850.82"
module.exports = function(price, decimals){
  return (typeof price ==='number' ? price : Number(price) ).toFixed(decimals)
}
