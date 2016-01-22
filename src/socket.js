var Log = require('./log.js')

var Directory
var Torrent

function Socket(socket, directory, torrent) {
  this.socket = socket
  Directory = directory
  Torrent = torrent

  this.socket.on("ready", function() {
    for (var key in Torrent.hashToChild) {
      Torrent.hashToChild[key].send({
        'type': 'info'
      })
    }
  })

  this.socket.on("download-t", function(url) {
    Torrent.start(url)
  })

  this.socket.on("list-d", function(dir) {
    socket.emit('list-d', Directory.list(dir))
  })

  this.socket.on("remove-t", function(hash) {
    Log.print('Remove torrent: ' + hash)
    Torrent.remove(hash)
    socket.emit('finish-t', hash)
  })

  this.socket.on("remove-d", function(file) {
    Directory.remove(file)
    socket.emit('update-d')
  })

  this.socket.on("rename-d", function(data) {
    Directory.rename(data.path, data.oldname, data.newname)
    socket.emit('update-d')
  })

  this.socket.on("mkdir-d", function(data) {
    Directory.mkdir(data.path, data.name)
    socket.emit('update-d')
  })

  this.socket.on("mv-d", function(data) {
    socket.emit('update-d')
  })
  this.socket.on("search-t", function(query) {
    var search = require('./searchT.js')
    search.search(query, socket)
  })
  this.socket.on("last-t", function() {
    var search = require('./searchT.js')
    search.latest(socket)
  })
  this.socket.on("infos-d", function(query) {
    console.log(query)
    var info = require('./mediaInfo.js')
    info.getInfo(query.type, query.query, socket)
  })

}

module.exports = Socket
