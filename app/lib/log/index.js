const _ = require('lodash')
const emoji = require('node-emoji')
// const clui = require('../../clui')

const emojilog = function(icon, args, method) {
  // console[method||'log'].apply(this, [emoji.get(icon), ' '].concat(args))
  console.log((emoji.get(icon)+'  '+args.join(' ')).toString('utf8'))
}
var time = 12
module.exports = {
  inspect: function() {
    emojilog('arrow_right', [].slice.call(arguments))
  },
  info: function() {
    let args = [].slice.call(arguments).map(o => _.isObject(o) ? ('\n'+JSON.stringify(o)) : o)
    console.log(('➢  '+args.join(' ')).toString('utf8'))
  },
  debug: function() {
    console.log([].slice.call(arguments).join(' '))
  },
  gtt: {
    log(level, message, meta) {
        // if(message.indexOf('If necessary')!==-1){
        //     return
        // }
        console.log(level+': '+message)
        if(meta) console.log(typeof meta==='object' ? JSON.stringify(meta) : meta)
    },
    error(err) {
      console.log('ERR:'+err)
    }
  },
  action: function() {
    emojilog('zap', [].slice.call(arguments))
  },
  // balances: require('./balances'),
  cash: function() {
    emojilog('moneybag', [].slice.call(arguments))
  },
  obj: function(data){
    console.log(JSON.stringify(data))
  },
  change: function(){
    emojilog('twisted_rightwards_arrows', [].slice.call(arguments))
  },
  usd: function() {
    emojilog('heavy_dollar_sign', [].slice.call(arguments))
  },
  btc: function() {
    emojilog('chart', [].slice.call(arguments))
  },
  happy: function() {
    emojilog('smile', [].slice.call(arguments))
  },
  success: function() {
    emojilog('white_check_mark', [].slice.call(arguments))
  },
  warn: function() {
    emojilog('radioactive_sign', [].slice.call(arguments))
  },
  error: function(level, data) {
    if(typeof data==='object'){
        return console.error(JSON.stringify(data))
    }
    console.error([].slice.call(arguments).join(' '))
  },
  fatal: function() {
    emojilog('skull_and_crossbones', [].slice.call(arguments), 'error')
  },
  time: function(){
    if(time===12){
      time = 0
    }
    time++
    emojilog('clock'+time, [].slice.call(arguments))
  }
}
