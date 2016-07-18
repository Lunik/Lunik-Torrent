var Log = require('./log.js')
var config = require('../configs/config.json')

var WebTorrent = require('webtorrent')

/**
 * Torrent Client.
 * @constructor
 */
function Client () {
  this.client = new WebTorrent()
  this.torrentLink = ''
  this.torrent = {}
  this.timeout = new Date().getTime()

  this.startFunction = function () {}
  this.updateFunction = function () {}
  this.doneFunction = function () {}
}

/**
 * Download a torrent.
 * @param {string} torrentLink - The link or magnet of the torrent.
*/
Client.prototype.download = function (torrentLink) {
  var self = this

  setTimeout(function () {
    self.torrentLink = torrentLink
    Log.echo('Start: ' + torrentLink)

    // download the torrent
    self.client.add(torrentLink, {
      path: config.torrent.downloads
    }, function (torrent) {
      // On torrent start
      self.torrent = torrent
      Log.print('Start torrent: ' + self.torrent.name)
      // emit start function with infoHash
      self.startFunction(torrent.infoHash)

      self.torrent.on('download', function (chunkSize) {
        var currentTime = new Date().getTime()
        if ((currentTime - self.timeout) > config.client.timeout) {
          // emit update function with torrent infos
          self.updateFunction(self.getTorrent())
          self.timeout = currentTime
        }
      })

      self.torrent.on('done', function () {
        Log.print('Finish torrent: ' + self.torrent.name)
        // emit done function with torrent hash and name
        self.doneFunction(self.torrent.infoHash, self.torrent.name)
      })

      self.torrent.on('noPeers', function () {
        Log.print('No peers: ' + self.torrent.name)
        // emit done function with torrent hash and name
        self.doneFunction(self.torrent.infoHash, self.torrent.name)
      })

      self.torrent.on('error', function (err) {
        Log.print('Error: ' + err)
      })
    })
  }, 1)
}

/**
 * Stop the current torrent of the client.
*/
Client.prototype.stop = function () {
  var self = this
  if (self.torrent) {
    self.torrent.pause()
    setTimeout(function () {
      self.torrent.destroy()
    }, 1000)
  }
}

/**
 * Get information about the current torrent of the client.
 * @return {object} - Torrent informations.
*/
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

/**
 * Set function for the client events.
 * @param {string} what - Name of the event (start, download, done).
 * @param {function} f - Function to execute.
*/
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
