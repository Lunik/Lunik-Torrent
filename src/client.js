var WebTorrent = require('webtorrent')
var Log = require('./log.js')

function Client () {
  this.client = new WebTorrent()
  this.config = require('./config.json')
  this.torrentLink = ''
  this.torrent = {}
  this.timeout = new Date().getTime()

  this.updateFunction = function () {}
  this.doneFunction = function () {}
}

Client.prototype.download = function (torrentLink) {
  this.torrent = torrentLink
  Log.print('Start: ' + torrentLink)

  this.client.add(torrentLink, {
    path: this.config.torrent.downloads
  }, function (torrent) {
    instClient.torrent = torrent
    Log.print('Start torrent: ' + instClient.torrent.name)

    instClient.torrent.on('download', function (chunkSize) {
      var currentTime = new Date().getTime()
      if ((currentTime - instClient.timeout) > instClient.config.client.timeout) {
        instClient.updateFunction(instClient.getTorrent())
        instClient.timeout = currentTime
      }
    })

    instClient.torrent.on('done', function () {
      Log.print('Finish torrent: ' + instClient.torrent.name)
      instClient.doneFunction(instClient.torrent.infoHash, instClient.torrent.name)
      instClient.torrent.destroy()
    })
  })
}

Client.prototype.stop = function () {}

Client.prototype.getTorrent = function () {
  var t = {}
  this.client.torrents.forEach(function (torrent) {
    if (!torrent.client.destroyed) {
      t.name = torrent.name
      t.size = torrent.length
      if (torrent.swarm) {
        t.hash = torrent.infoHash
        t.sdown = torrent.swarm.downloadSpeed()
        t.sup = torrent.swarm.uploadSpeed()
        t.down = torrent.swarm.downloaded
        t.up = torrent.swarm.uploaded
        t.seed = torrent.swarm._peersLength
        t.progress = torrent.progress
        t.timeRemaining = torrent.timeRemaining
      }
    }
  })

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

var instClient = new Client()
module.exports = instClient
