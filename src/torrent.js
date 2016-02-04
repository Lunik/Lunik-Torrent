var Log = require('./log.js')
var config = require('./config.json')

var cp = require('child_process')
var fs = require('fs')

function Torrent () {
  this.urlToChild = {}
  this.hashToChild = {}
  this.urlToHash = {}

  this.info = {}
  this.waitList = {}
  this.countTry = {}

  setInterval(this.startPointTorrent, 30000)
}

Torrent.prototype.start = function (url) {
  if (this.countTry[url] == null) {
    this.countTry[url] = 1
  } else {
    this.countTry[url]++
  }
  if (this.countTry[url] > config.client.maxTry) {
    return -1
  }

  Log.print('Try nb ' + this.countTry[url] + ' to download: ' + url)
  // evite de lancer deux fois le meme torrent
  if (this.urlToChild[url] == null) {
    // Si trop de torrent en cours
    if (Object.keys(this.urlToChild).length < config.torrent.max) {
      var n = cp.fork(__dirname + '/tclient.js')
      this.urlToChild[url] = n
      // this.io.sockets.emit('start-t')
      n.on('message', function (data) {
        switch (data.type) {
          case 'finish':
            n.kill('SIGHUP')
            delete instTorrent.info[data.hash]

            delete instTorrent.urlToChild[url]
            delete instTorrent.urlToHash[url]
            delete instTorrent.hashToChild[data.hash]
            fs.renameSync(config.torrent.downloads + data.name, config.directory.path + data.name)
            // Relance un torrent si il y en a en attente
            if (instTorrent.waitList.length > 0) {
              instTorrent.start(instTorrent.waitList[0])
              instTorrent.waitList.shift()
            }
            break
          case 'info':
            instTorrent.info[data.torrent.hash] = data.torrent
            instTorrent.hashToChild[data.torrent.hash] = n
            instTorrent.urlToHash[url] = data.torrent.hash
            break
          case 'remove':
            n.kill('SIGHUP')
            delete instTorrent.info[data.hash]

            delete instTorrent.urlToChild[url]
            delete instTorrent.urlToHash[url]
            delete instTorrent.hashToChild[data.hash]
            fs.unlinkSync(config.torrent.downloads + data.name)
            // Relance un torrent si il y en a en attente
            if (instTorrent.waitList.length > 0) {
              instTorrent.start(this.waitList[0])
              instTorrent.waitList.shift()
            }
        }
      })

      n.on('exit', function (code, signal) {
        if (signal !== 'SIGHUP') {
          Log.print('Child: ' + url + ' \n exit with code: ' + code)
          delete instTorrent.info[instTorrent.urlToHash[url]]

          delete instTorrent.urlToChild[url]
          delete instTorrent.hashToChild[instTorrent.urlToHash[url]]
          delete instTorrent.urlToHash[url]
          instTorrent.start(url)
        }
      })

      n.send({
        'type': 'download',
        'torrent': url
      })
    } else {
      Log.print('Too much client. Adding torrent to the waitlist.')
      // On push dans la liste d'attente
      if (this.waitList.indexOf(url) === -1) {
        this.waitList.push(url)
      }
    }
  } else {
    Log.print('Torrent is already downloading.')
  }
}

Torrent.prototype.remove = function (hash) {
  this.hashToChild[hash].send({
    'type': 'remove'
  })
}

Torrent.prototype.on = function (what, f) {
  switch (what) {
    case 'start':

      break
    default:

  }
}

Torrent.prototype.startPointTorrent = function () {
  var data = fs.readFileSync(config.torrent.scanTorrent, 'utf-8')
  var torrents = data.split('\n')
  fs.writeFileSync(config.torrent.scanTorrent, '', 'utf-8')
  torrents.forEach(function (element) {
    if (element !== '') {
      instTorrent.start(element)
    }
  })
}

var instTorrent = new Torrent()
module.exports = instTorrent
