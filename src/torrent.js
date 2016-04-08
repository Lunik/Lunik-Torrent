var Log = require('./log.js')
var config = require('./config.json')
var Client = require('./client.js')

var cp = require('child_process')
var fs = require('fs')

function Torrent () {
  this.client = {}

  this.info = {}
  this.waitList = []

  setInterval(this.startPointTorrent, 30000)
}

Torrent.prototype.start = function (url) {
  var self = this
    if(self.client[url] == null){
      self.client[url] = {count: 1}
    } else {
      self.client[url].count++
    }

    if(self.client[url].count > config.client.maxTry){
      return -1;
    }
  setTimeout(function(){
    // evite de lancer deux fois le meme torrent
    if(self.client[url].peer == null){
      // Si trop de torrent en cours
      if (Object.keys(self.client).length < config.torrent.max) {
        var c = new Client()
        c.download(url)

        c.on('start', function(hash){
          self.client[url].hash = hash
        })

        c.on('download', function(infos){
          self.client[url].infos = infos
        })

        c.on('done', function(hash, name){
          self.client[url].peer.stop()
          delete self.client[url]
          //Deplace les fichies
          console.log(config.torrent.downloads + name, config.directory.path + name)
          fs.renameSync(config.torrent.downloads + name, config.directory.path + name)
          // Relance un torrent si il y en a en attente
          if (self.waitList.length > 0) {
            Log.print('Start torrent into waitList (left: ' + (self.waitList.length - 1) + ')')
            self.start(self.waitList.shift())
          }
        })

        self.client[url].peer = c
      } else {
        Log.print('Too much client. Adding torrent to the waitlist.')
        // On push dans la liste d'attente
        if (this.waitList.indexOf(url) === -1) {
          this.waitList.push(url)
        }
      }
    }  else {
      Log.print('Torrent is already downloading.')
    }
  }, 1)
}

Torrent.prototype.remove = function (hash) {
  var url = getUrlFromHash(hash)
  if(url){
    this.client[url].peer.stop()
    delete this.client[url];
  }
}

Torrent.prototype.getUrlFromHash = function(hash){
  for(var key in this.client){
    if(this.client[key].hash == hash){
      return key
    }
  }
  return null
}

Torrent.prototype.startPointTorrent = function () {
  var self = this

  var data = fs.readFileSync(config.torrent.scanTorrent, 'utf-8')
  var torrents = data.split('\n')
  fs.writeFileSync(config.torrent.scanTorrent, '', 'utf-8')
  torrents.forEach(function (element) {
    if (element !== '') {
      self.start(element)
    }
  })
}

Torrent.prototype.getInfo = function(){
    var torrents = {}
    for(var key in this.client){
      var t = this.client[key].infos
      if(t){
        torrents[t.hash] = t
      }
    }
    return torrents
}

module.exports = new Torrent()
