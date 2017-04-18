'use strict'

var cloudscraper = require('cloudscraper')
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
function Torrent () {
  DB.torrent.remove({}, { multi: true }, function (err) {
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
Torrent.prototype.start = function (user, url) {
  var self = this

  var preprocess = function () {
    if (url.match(/magnet.*/)) {
      start(url)
    } else if (url.match(/https?.*/g)) {
      cloudscraper.get(url, function (err, res, body) {
        if (err) {
          LogWorker.error(err)
          return
        }
        start(res.body)
      })
    } else {
      LogWorker.error(`Cannot handle this kind of download: ${url}`)
    }
  }

  var start = function (torrentId) {
    var c = new Client()
    c.download(torrentId, url, function (hash) {
      self.client[hash] = c
    }, function (err, torrent) {
      delete self.client[torrent.infoHash]
      if (err) {
        LogWorker.error(`Fail downloading: ${url}`)
      } else {
        c.stop()
        LogWorker.info(`Moving: ${Path.join(__config.torrent.downloads, torrent.name)} to ${Path.join(__config.directory.path, torrent.name)}`)
        fs.move(Path.join(__config.torrent.downloads, torrent.name), Path.join(__config.directory.path, torrent.name), function (err) {
          if (err) {
            LogWorker.error(err)
          } else {
            Directory.list('', function () {
              Directory.setOwner(torrent.name, user)
            })
          }
        })
      }
    })
  }
  setTimeout(preprocess)
}

/**
 * Stop and remove a torrent.
 * @param {string} hash - Torrent to remove Hash.
*/
Torrent.prototype.remove = function (hash) {
  if (this.client[hash]) {
    this.client[hash].stop()
  }
}

Torrent.prototype.getInfo = function (cb) {
  DB.torrent.find({}, function (err, files) {
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
Torrent.prototype.setDownloader = function (user, url) {}
module.exports = new Torrent()
