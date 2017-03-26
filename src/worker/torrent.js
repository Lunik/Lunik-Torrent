'use strict'

var fs = require('fs-extra')
var Path = require('path')
var Database = require(Path.join(__workingDir, 'database/client.js'))
var DB = {
  torrent: new Database('torrent', __config.database.host, __config.database.port, __DBtoken)
}

var Directory = require(Path.join(__workingDir, 'worker/directory'))
var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Torrent'
})
var Client = require(Path.join(__workingDir, 'worker/client.js'))

/**
 * Torrent manager.
 * @constructor
*/
class Torrent {
  constructor () {
    DB.torrent.remove({}, { multi: true }, (err) => {
      if (err) {
        LogWorker.error(err)
      }
    })

    this.client = {}
    this.waitList = []
  }

/**
 * Start downloadind torrent.
 * @param {string} url - Url / magnet of the torrent.
*/
  start (user, url) {
    var start = () => {
      var c = new Client()
      c.download(url, (hash) => {
        this.client[hash] = c
      }, (err, torrent) => {
        delete this.client[torrent.infoHash]
        if (err) {
          LogWorker.error(`Fail downloading: ${url}`)
        } else {
          c.stop()
          LogWorker.info(`Moving: ${Path.join(__config.torrent.downloads, torrent.name)} to ${Path.join(__config.directory.path, torrent.name)}`)
          fs.move(Path.join(__config.torrent.downloads, torrent.name), Path.join(__config.directory.path, torrent.name), (err) => {
            if (err) {
              LogWorker.error(err)
            } else {
              Directory.list('', () => {
                Directory.setOwner(torrent.name, user)
              })
            }
          })
        }
      })
    }
    setTimeout(start)
  }

/**
 * Stop and remove a torrent.
 * @param {string} hash - Torrent to remove Hash.
*/
  remove (hash) {
    if (this.client[hash]) {
      this.client[hash].stop()
    }
  }

  getInfo (cb) {
    DB.torrent.find({}, (err, files) => {
      if (err) {
        LogWorker.error(err)
        cb([])
      } else {
        cb(files)
      }
    })
  }

/**
 * Define who download a torrent.
 * @param {string} user - User who download the torrent.
 * @param {string} url - Torrent url.
*/
  setDownloader (user, url) {}

}
module.exports = new Torrent()
