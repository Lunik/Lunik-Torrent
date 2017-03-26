'use strict'
var Path = require('path')
var WebTorrent = require('webtorrent')
var Database = require(Path.join(__workingDir, 'database/client.js'))
var DB = {
  torrent: new Database('torrent', __config.database.host, __config.database.port, __DBtoken)
}

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Client'
})

/**
 * Torrent Client.
 * @constructor
 */
class Client {
  constructor () {
    this.client = null
    this.timeout = new Date().getTime()
  }

/**
 * Download a torrent.
 * @param {string} torrentLink - The link or magnet of the torrent.
*/
  download (torrentLink, cbStart, cbDone) {
    var download = () => {
      LogWorker.info(`Start: ${torrentLink}`)

      this.client = new WebTorrent()

      var timeout = setTimeout(() => {
        LogWorker.warning(`${torrentLink} didn't start on time, removing it.`)
        this.stop()
      }, __config.client.timeout)

      this.client.add(torrentLink, {
        path: __config.torrent.downloads
      }, (torrent) => {
        clearTimeout(timeout)

        LogWorker.info(`Start torrent: ${torrent.name}`)
        cbStart(torrent.infoHash)

        torrent.on('download', (chunkSize) => {
          var currentTime = new Date().getTime()
          if ((currentTime - this.timeout) > __config.client.updateTimeout) {
          // emit update function with torrent infos
            this.updateFunction(torrent)
            this.timeout = currentTime
          }
        })

        torrent.on('done', () => {
          LogWorker.info(`Finish torrent: ${torrent.name}`)
          this.doneFunction(torrent)
          cbDone(null, this.getTorrent(torrent))
        })

        torrent.on('noPeers', () => {
          LogWorker.warning(`No peers: ${torrent.name}`)
          this.doneFunction(torrent)
          cbDone(null, this.getTorrent(torrent))
        })

        torrent.on('error', (err) => {
          LogWorker.error(err)
          this.doneFunction(null)
          cbDone('Download error', this.getTorrent(torrent))
        })
      })
    }

    setTimeout(download)
  }

/**
 * Stop the current torrent of the client.
*/
  stop () {
    var stop = () => {
      this.doneFunction(this.client.torrents[0])
      try {
        this.client.destroy((err) => {
          if (err) {
            LogWorker.error(err)
          }
        })
      } catch (err) {
        LogWorker.warning(err)
      }
    }

    setTimeout(stop)
  }

/**
 * Get information about the current torrent of the client.
 * @return {object} - Torrent informations.
*/
  getTorrent (torrent) {
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

  updateFunction (torrent) {
    if (torrent) {
      var torrentInfo = this.getTorrent(torrent)

      DB.torrent.find({
        hash: torrentInfo.hash
      }, (err, t) => {
        if (err) {
          LogWorker.error(err)
        } else {
          if (t.length <= 0) {
            DB.torrent.insert(torrentInfo)
          } else {
            DB.torrent.update({
              hash: torrentInfo.hash
            }, {
              $set: torrentInfo
            }, {}, (err) => {
              if (err) {
                LogWorker.error(err)
              }
            })
          }
        }
      })
    }
  }

  doneFunction (torrent) {
    if (torrent) {
      var torrentInfo = this.getTorrent(torrent)
      DB.torrent.remove({
        hash: torrentInfo.hash
      }, (err) => {
        if (err) {
          LogWorker.error(err)
        }
      })
    }
  }
}
module.exports = Client
