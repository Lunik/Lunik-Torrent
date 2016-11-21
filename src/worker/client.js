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
  this.client = null
  this.timeout = new Date().getTime()
}

/**
 * Download a torrent.
 * @param {string} torrentLink - The link or magnet of the torrent.
*/
Client.prototype.download = function (torrentLink, cbStart, cbDone) {
  var self = this

  var download = function () {
    LogWorker.info(`Start: ${torrentLink}`)

    self.client = new WebTorrent()

    var timeout = setTimeout(function () {
      self.stop()
    }, __config.client.timeout)

    self.client.add(torrentLink, {
      path: __config.torrent.downloads
    }, function(torrent){
      clearTimeout(timeout)

       LogWorker.info(`Start torrent: ${torrent.name}`)
       cbStart(torrent.infoHash)

       torrent.on('download', function (chunkSize) {
        var currentTime = new Date().getTime()
        if ((currentTime - self.timeout) > __config.client.updateTimeout) {
          // emit update function with torrent infos
          self.updateFunction(torrent)
          self.timeout = currentTime
        }
      })

      torrent.on('done', function(){
        LogWorker.info(`Finish torrent: ${torrent.name}`)
        self.doneFunction(torrent)
        cbDone(null, self.getTorrent(torrent))
      })

      torrent.on('noPeers', function () {
        LogWorker.warning(`No peers: ${torrent.name}`)
        self.doneFunction(torrent)
        cbDone('No peers', self.getTorrent(torrent))
      })

      torrent.on('error', function (err) {
        LogWorker.error(err)
        self.doneFunction(null)
        cbDone('Download error', self.getTorrent(torrent))
      })
    })
  }

  setTimeout(download)
}

/**
 * Stop the current torrent of the client.
*/
Client.prototype.stop = function () {
  var self = this

  var stop = function(){
    try {
      self.client.destroy(function(err){
        if(err){
          LogWorker.error(err)
        }
      })
    } catch (err){
      LogWorker.error(err)
    }
  }

  setTimeout(stop)
}

/**
 * Get information about the current torrent of the client.
 * @return {object} - Torrent informations.
*/
Client.prototype.getTorrent = function (torrent) {
  var t = {}
  if (torrent) {
    t.name = torrent.name
    t.size = torrent.length
    t.hash = torrent.infoHash
    t.sdown = torrent.downloadSpeed
    t.sup = torrent.uploadSpeed
    t.down = torrent.downloaded
    t.up = torrent.uploaded
    t.seed = torrent._peersLength
    t.progress = torrent.progress
    t.timeRemaining = torrent.timeRemaining
  }

  return t
}

Client.prototype.updateFunction = function(torrent){
  if(torrent){
    var torrentInfo = this.getTorrent(torrent)

    __DB.torrent.find({
      hash: torrentInfo.hash
    }, function(err, t){
      if(err){
        LogWorker.error(err)
      } else {
        if(t.length <= 0){

          __DB.torrent.insert(torrentInfo)
        } else {

          __DB.torrent.update({
            hash: torrentInfo.hash
          }, {
            $set: torrentInfo
          }, {}, function(err){
            if(err){
              LogWorker.error(err)
            }
          })
        }
      }
    })
  }
}

Client.prototype.doneFunction = function(torrent){
  if(torrent){
    __DB.torrent.remove({
      hash: torrent.hash
    }, function(err){
      if(err){
        LogWorker.error(err)
      }
    })
  }
}

module.exports = Client
