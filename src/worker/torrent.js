'use strict'

var fs = require('fs-extra')
var Path = require('path')
var Database = require(Path.join(__base, 'src/database/client.js'))
var DB = {
  torrent: new Database('torrent', '127.0.0.1', __config.database.port, __DBtoken)
}

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Torrent'
})
var Client = require(Path.join(__base, 'src/worker/client.js'))

/**
 * Torrent manager.
 * @constructor
*/
function Torrent () {
  var self = this

  DB.torrent.remove({}, { multi: true }, function (err) {
    if (err) {
      LogWorker.error(err)
    }
  })

  this.client = {}
  this.waitList = []

  setInterval(function () {
    self.startPointTorrent(self)
  }, 30000)
}

/**
 * Start downloadind torrent.
 * @param {string} url - Url / magnet of the torrent.
*/
Torrent.prototype.start = function (user, url) {
  var self = this

  var start = function () {
    // evite de lancer deux fois le meme torrent
    if (self.client[url] == null) {
      // Si trop de torrent en cours
      if (Object.keys(self.client).length < __config.torrent.max) {
        var c = new Client()

        self.client[url] = c

        c.download(url, function (hash) {
          self.client[hash] = c
        }, function (err, torrent) {
          delete self.client[url]
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
                if (self.waitList.length > 0) {
                  LogWorker.info(`Start torrent into waitList (left: ${(self.waitList.length - 1)})`)
                  var next = self.waitList.shift()
                  self.start(next.user, next.url)
                }
              }
            })
          }
        })
      } else {
        LogWorker.warning('Too much client. Adding torrent to the waitlist.')
        // On push dans la liste d'attente
        if (self.waitList.indexOf(url) === -1) {
          self.waitList.push({
            url: url,
            user: user
          })
        }
      }
    } else {
      LogWorker.warning('Torrent is already downloading.')
    }
  }

  setTimeout(start)
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

/**
 * Start torrent into configured torrent file.
 * @param {object} self - Torrent instance.
*/
Torrent.prototype.startPointTorrent = function (self) {
  fs.readFile(Path.join(__config.torrent.scanTorrent), 'utf-8', function (err, data) {
    if (err) {
      LogWorker.error(err)
    } else {
      var torrents = data.split('\n')
      fs.writeFile(Path.join(__config.torrent.scanTorrent), '', 'utf-8', function (err) {
        if (err) {
          LogWorker.error(err)
        } else {
          torrents.forEach(function (element) {
            if (element !== '') {
              self.start('-', element)
            }
          })
        }
      })
    }
  })
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
