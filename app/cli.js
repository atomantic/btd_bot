#!/usr/bin/env node
var chalk = require('chalk')
require('yargs')
  // .commandDir('commands')
  .command(require('./commands/buy'))
  .command(require('./commands/sell'))
  .demand(1)
  .option('d', {
    alias: 'debug',
    boolean: true,
    describe: 'enable debug logging'
  })
  .option('f', {
    alias: 'forever',
    boolean: true,
    describe: 'continuous investment mode'
  })
  .option('t', {
    alias: 'test',
    boolean: true,
    describe: 'test mode (no real trades)'
  })
  .usage('Usage: $0 ' + chalk.green('<command>') + ' '+ chalk.yellow('[options]'))
  .help()
  .version()
  .alias('h', 'help')
  .alias('v', 'version')
  .argv

  require('./lib/process')