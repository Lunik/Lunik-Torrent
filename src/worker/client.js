'use strict'
var Path = require('path')
var WebTorrent = require('webtorrent')

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Client'
})

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
Client.prototype.download = function (torrentLink, cb) {
  var self = this

  var dl = function (torrentLink) {
    self.torrentLink = torrentLink
    LogWorker.info(`Start: ${torrentLink}`)

    var timeout = setTimeout(function () {
      self.client.destroy(function () {
        self.doneFunction(true, null, null)
      })
    }, __config.client.timeout)
    // download the torrent
    self.client.add(torrentLink, {
      path: __config.torrent.downloads
    }, function (torrent) {
      clearTimeout(timeout)
      // On torrent start
      self.torrent = torrent
      LogWorker.info(`Start torrent: ${torrent.name}`)
      // emit start function with infoHash
      self.startFunction(torrent.infoHash)

      torrent.on('download', function (chunkSize) {
        var currentTime = new Date().getTime()
        if ((currentTime - self.timeout) > __config.client.updateTimeout) {
          // emit update function with torrent infos
          self.updateFunction(self.getTorrent())
          self.timeout = currentTime
        }
      })

      torrent.on('done', function () {
        LogWorker.info(`Finish torrent: ${self.torrent.name}`)
        // emit done function with torrent hash and name
        self.doneFunction(false, torrent.infoHash, torrent.name)
      })

      torrent.on('noPeers', function () {
        LogWorker.warning(`No peers: ${torrent.name}`)
        // emit done function with torrent hash and name
        self.doneFunction(false, torrent.infoHash, torrent.name)
      })

      torrent.on('error', function (err) {
        LogWorker.error(err)
        self.doneFunction(true, null, null)
        return
      })
    })
  }

  cb(dl(torrentLink))
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
