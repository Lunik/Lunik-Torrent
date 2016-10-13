'use strict'

var fs = require('fs')
var Path = require('path')

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
  this.client = {}

  this.dowloader = {}
  this.waitList = []

  setInterval(function () {
    self.startPointTorrent(self)
  }, 30000)
}

/**
 * Start downloadind torrent.
 * @param {string} url - Url / magnet of the torrent.
*/
Torrent.prototype.start = function (url) {
  var self = this
  // evite de lancer deux fois le meme torrent
  if (self.client[url] == null) {
    // Si trop de torrent en cours
    if (Object.keys(self.client).length < __config.torrent.max) {
      if (self.client[url] == null) {
        self.client[url] = {count: 1}
      } else {
        self.client[url].count++
      }

      if (self.client[url].count > __config.client.maxTry) {
        return -1
      }
      var c = new Client()
      c.download(url, function () {})

      c.on('start', function (hash) {
        if (self.client[url]) {
          self.client[url].hash = hash
        }
      })

      c.on('download', function (infos) {
        if (self.client[url]) {
          self.client[url].infos = infos
        }
      })

      c.on('done', function (err, hash, name) {
        if (self.client[url]) {
          if (err) {
            LogWorker.error(`Fail downloading: ${url}`)
            delete self.client[url]
            return
          }
          self.client[url].peer.stop()
          // Deplace les fichies
          LogWorker.info(`Moving: ${Path.join(__config.torrent.downloads, name)} to ${Path.join(__config.directory.path, name)}`)
          fs.renameSync(Path.join(__base, __config.torrent.downloads, name), Path.join(__base, __config.directory.path, name))
          // Defini l'owner
          if (self.dowloader[url]) {
            self.Directory.setOwner(name, self.dowloader[url])
          }
          delete self.client[url]
          // Relance un torrent si il y en a en attente
          if (self.waitList.length > 0) {
            LogWorker.info(`Start torrent into waitList (left: ${(self.waitList.length - 1)})`)
            self.start(self.waitList.shift())
          }
        }
      })

      self.client[url].peer = c
    } else {
      LogWorker.warning('Too much client. Adding torrent to the waitlist.')
      // On push dans la liste d'attente
      if (self.waitList.indexOf(url) === -1) {
        self.waitList.push(url)
      }
    }
  } else {
    LogWorker.warning('Torrent is already downloading.')
  }
}

/**
 * Stop and remove a torrent.
 * @param {string} hash - Torrent to remove Hash.
*/
Torrent.prototype.remove = function (hash) {
  var url = this.getUrlFromHash(hash)
  if (url && this.client[url]) {
    this.client[url].peer.stop()
    delete this.client[url]
  }
}

/**
 * Get torrent url from hash.
 * @param {string} hash - Torrent Hash.
 * @return {string} - Torrent turl.
*/
Torrent.prototype.getUrlFromHash = function (hash) {
  for (var key in this.client) {
    if (this.client[key].hash === hash) {
      return key
    }
  }
  return null
}

/**
 * Start torrent into configured torrent file.
 * @param {object} self - Torrent instance.
*/
Torrent.prototype.startPointTorrent = function (self) {
  fs.readFile(Path.join(__base, __config.torrent.scanTorrent), 'utf-8', function(err, data){
    if(err){
      LogWorker.error(err)
      return
    }
    var torrents = data.split('\n')
    fs.writeFile(Path.join(__base, __config.torrent.scanTorrent), '', 'utf-8', function(err){
      if(err){
        LogWorker.error(err)
        return
      }
      torrents.forEach(function (element) {
        if (element !== '') {
          self.start(element)
        }
      })
    })
  })
}

/**
 * Get infos about all current clients.
 * @return {object} - All torrent infos.
*/
Torrent.prototype.getInfo = function () {
  var torrents = {}
  for (var key in this.client) {
    var t = this.client[key].infos
    if (t) {
      torrents[t.hash] = t
    }
  }
  return torrents
}

/**
 * Define who download a torrent.
 * @param {string} user - User who download the torrent.
 * @param {string} url - Torrent url.
*/
Torrent.prototype.setDownloader = function (user, url) {
  this.dowloader[url] = user
}
module.exports = new Torrent()
