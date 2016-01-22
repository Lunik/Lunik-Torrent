var Socket = require('./socket.js')
var Directory = require('./directory.js')
var Torrent = require('./torrent.js')

var io = require('socket.io')

function Io (server, directory, torrent) {
  this.io = io(server)
  Torrent.io = this.io
  this.io.on('connection', function (so) {
    var s = new Socket(so, Directory, Torrent)
  })
}

module.exports = Io
