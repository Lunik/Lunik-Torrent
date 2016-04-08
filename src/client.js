var Log = require('./log.js')
var config = require('./config.json')

var WebTorrent = require('webtorrent')

function Client () {
  this.client = new WebTorrent()
  this.torrentLink = ''
  this.torrent = {}
  this.timeout = new Date().getTime()

  this.updateFunction = function () {}
  this.doneFunction = function () {}
}

Client.prototype.download = function (torrentLink) {
  var self = this

  setTimeout(function(){
    self.torrent = torrentLink
    Log.echo('Start: ' + torrentLink)

    self.client.add(torrentLink, {
      path: config.torrent.downloads
    }, function (torrent) {
      self.torrent = torrent
      Log.print('Start torrent: ' + self.torrent.name)
      self.updateFunction(self.getTorrent())

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
        self.torrent.destroy()
      })
    })
  }, 1)
}

Client.prototype.stop = function () {}

Client.prototype.getTorrent = function () {
  var t = {}
  if (!this.torrent.client.destroyed) {
    t.name = this.torrent.name
    t.size = this.torrent.length
    if (this.torrent.swarm) {
      t.hash = this.torrent.infoHash
      t.sdown = this.torrent.swarm.downloadSpeed()
      t.sup = this.torrent.swarm.uploadSpeed()
      t.down = this.torrent.swarm.downloaded
      t.up = this.torrent.swarm.uploaded
      t.seed = this.torrent.swarm._peersLength
      t.progress = this.torrent.progress
      t.timeRemaining = this.torrent.timeRemaining
    }
  }

  return t
}
// callBack when update
Client.prototype.on = function (what, f) {
  switch (what) {
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

module.exports = new Client()
