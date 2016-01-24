var Server = require('./server.js')

var Io = require('./io.js')
Io(Server.server)

var update = require('./update.js')
