'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Server = require(Path.join(__base, 'src/worker/server.js'))
var Update = require(Path.join(__base, 'src/worker/update.js'))


// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var gracefulShutdown = function () {
  Server.server.close(function () {
    process.exit()
  })

  // if after
  setTimeout(function () {
    process.exit()
  }, 10 * 1000)
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown)

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown)
