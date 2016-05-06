var Server = require('./server.js')

var update = require('./update.js')

// this function is called when you want the server to die gracefully
// i.e. wait for existing connections
var gracefulShutdown = function () {
  console.log('Received kill signal, shutting down gracefully.')
  Server.server.close(function () {
    console.log('Closed out remaining connections.')
    process.exit()
  })

  // if after
  setTimeout(function () {
    console.error('Could not close connections in time, forcefully shutting down')
    process.exit()
  }, 10 * 1000)
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown)

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown)
