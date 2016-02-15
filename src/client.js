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
  this.torrent = torrentLink
  Log.echo('Start: ' + torrentLink)

  this.client.add(torrentLink, {
    path: config.torrent.downloads
  }, function (torrent) {
    instClient.torrent = torrent
    Log.print('Start torrent: ' + instClient.torrent.name)
    instClient.updateFunction(instClient.getTorrent())

    instClient.torrent.on('download', function (chunkSize) {
      var currentTime = new Date().getTime()
      if ((currentTime - instClient.timeout) > config.client.timeout) {
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

var instClient = new Client()
module.exports = instClient
