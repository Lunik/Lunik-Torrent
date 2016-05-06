var Server = require('./server.js')

var update = require('./update.js')

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
