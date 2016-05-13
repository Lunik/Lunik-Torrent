var Log = require('./log.js')
var config = require('./config.json')

var WebTorrent = require('webtorrent')

function Client () {
  this.client = new WebTorrent()
  this.torrentLink = ''
  this.torrent = {}
  this.timeout = new Date().getTime()

  this.startFunction = function () {}
  this.updateFunction = function () {}
  this.doneFunction = function () {}
}

Client.prototype.download = function (torrentLink) {
  var self = this

  setTimeout(function () {
    self.torrentLink = torrentLink
    Log.echo('Start: ' + torrentLink)

    self.client.add(torrentLink, {
      path: config.torrent.downloads
    }, function (torrent) {
      self.torrent = torrent
      Log.print('Start torrent: ' + self.torrent.name)
      self.startFunction(torrent.infoHash)

      self.torrent.on('download', function (chunkSize) {
        var currentTime = new Date().getTime()
        if ((currentTime - self.timeout) > config.client.timeout) {
          self.updateFunction(self.getTorrent())
          self.timeout = currentTime
        }
      })

      self.torrent.on('done', function () {
        Log.print('Finish torrent: ' + self.torrent.name)
        self.doneFunction(self.torrent.infoHash, self.torrent.name)
      })

      self.torrent.on('noPeers', function () {
        Log.print('No peers: ' + self.torrent.name)
        self.doneFunction(self.torrent.infoHash, self.torrent.name)
      })
    })
  }, 1)
}

Client.prototype.stop = function () {
  var self = this
  if (self.torrent) {
    self.torrent.pause()
    setTimeout(function () {
      self.torrent.destroy()
    }, 1000)
  }
}

Client.prototype.getTorrent = function () {
  var t = {}
  if (this.torrent) {
    if (!this.torrent.client.destroyed) {
      t.name = this.torrent.name
      t.size = this.torrent.length
      t.hash = this.torrent.infoHash
      t.sdown = this.torrent.downloadSpeed
      t.sup = this.torrent.uploadSpeed
      t.down = this.torrent.downloaded
      t.up = this.torrent.uploaded
      t.seed = this.torrent._peersLength
      t.progress = this.torrent.progress
      t.timeRemaining = this.torrent.timeRemaining
    }
  }

  return t
}
// callBack when update
Client.prototype.on = function (what, f) {
  switch (what) {
    case 'start':
      this.startFunction = f
      break
    case 'download':
      // function(download){}
      this.updateFunction = f
      break
    case 'done':
      // function(torrentHash, torrentName){}
      this.doneFunction = f
      break
  }
}

module.exports = Client
