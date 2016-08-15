// launch the server

var path = require('path')

global.__base = path.join(__dirname, '..', '/')

var Server = require(path.join(__base, 'src/server.js'))
var Update = require(path.join(__base, 'src/update.js'))
var Config = require(path.join(__base, 'src/config.js'))

var ConfigWorker = new Config()
global.__config = ConfigWorker.load(path.join(__base, 'configs/config.json'))

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
