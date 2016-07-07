var Log = require('./log.js')
var config = require('../configs/config.json')
var Client = require('./client.js')

var fs = require('fs')
var Path = require('path')

function Torrent () {
  var self = this
  this.client = {}

  this.dowloader = {}
  this.waitList = []

  setInterval(function () {
    self.startPointTorrent(self)
  }, 30000)
}

Torrent.prototype.start = function (url) {
  var self = this
  setTimeout(function () {
    // evite de lancer deux fois le meme torrent
    if (self.client[url] == null) {
      // Si trop de torrent en cours
      if (Object.keys(self.client).length < config.torrent.max) {
        if (self.client[url] == null) {
          self.client[url] = {count: 1}
        } else {
          self.client[url].count++
        }

        if (self.client[url].count > config.client.maxTry) {
          return -1
        }
        var c = new Client()
        c.download(url)

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

        c.on('done', function (hash, name) {
          if (self.client[url]) {
            self.client[url].peer.stop()
            delete self.client[url]
            // Deplace les fichies
            console.log(Path.join(config.torrent.downloads, name), Path.join(config.directory.path, name))
            fs.renameSync(Path.join(config.torrent.downloads, name), Path.join(config.directory.path, name))
            // Defini l'owner
            self.Directory.setOwner(name, self.dowloader[url])
            // Relance un torrent si il y en a en attente
            if (self.waitList.length > 0) {
              Log.print('Start torrent into waitList (left: ' + (self.waitList.length - 1) + ')')
              self.start(self.waitList.shift())
            }
          }
        })

        self.client[url].peer = c
      } else {
        Log.print('Too much client. Adding torrent to the waitlist.')
        // On push dans la liste d'attente
        if (self.waitList.indexOf(url) === -1) {
          self.waitList.push(url)
        }
      }
    } else {
      Log.print('Torrent is already downloading.')
    }
  }, 1)
}

Torrent.prototype.remove = function (hash) {
  var url = this.getUrlFromHash(hash)
  if (url && this.client[url]) {
    this.client[url].peer.stop()
    delete this.client[url]
  }
}

Torrent.prototype.getUrlFromHash = function (hash) {
  for (var key in this.client) {
    if (this.client[key].hash === hash) {
      return key
    }
  }
  return null
}

Torrent.prototype.startPointTorrent = function (self) {
  var data = fs.readFileSync(config.torrent.scanTorrent, 'utf-8')
  var torrents = data.split('\n')
  fs.writeFileSync(config.torrent.scanTorrent, '', 'utf-8')
  torrents.forEach(function (element) {
    if (element !== '') {
      self.start(element)
    }
  })
}

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

Torrent.prototype.setDownloader = function(user, url){
  this.dowloader[url] = user
}
module.exports = new Torrent()
