var CONFIG = require('./config.js')
var WebTorrent = require('webtorrent')
var client = new WebTorrent()

var fs = require('fs')

var theTorrent
process.on('message', function (data) {
  switch (data.type) {
    case 'download':
      log('Child pid: ' + process.pid + ' start: ' + data.torrent)
      client.add(data.torrent, {
        path: CONFIG.DOWNLOADS
      }, function (torrent) {
        theTorrent = torrent
        // Got torrent metadata!
        log('Start torrent: ' + torrent.name)

        var timeout = new Date().getTime()
        torrent.on('download', function (chunkSize) {
          var currentTime = new Date().getTime()
          if ((currentTime - timeout) > 3000) {
            process.send({
              'type': 'info',
              'torrent': listTorrents()
            })
            timeout = currentTime
          }
        })

        torrent.on('done', function () {
          log('Finish torrent: ' + torrent.name)
          process.send({
            'type': 'finish',
            'hash': torrent.infoHash,
            'name': torrent.name
          })
          torrent.destroy()
        })
      })
      break

    case 'info':
      process.send({
        'type': 'info',
        'torrent': listTorrents()
      })
      break

    case 'remove':
      log('Removing torrent: ' + theTorrent.name)
      process.send({
        'type': 'finish',
        'hash': theTorrent.infoHash,
        'name': theTorrent.name
      })
      theTorrent.destroy()
      break
  }
})

function listTorrents () {
  var t = {}
  client.torrents.forEach(function (torrent) {
    if (!torrent.client.destroyed) {
      t.name = torrent.name
      t.size = torrent.length
      if (torrent.swarm) {
        t.hash = torrent.infoHash
        t.sdown = torrent.swarm.downloadSpeed()
        t.sup = torrent.swarm.uploadSpeed()
        t.down = torrent.swarm.downloaded
        t.up = torrent.swarm.uploaded
        t.seed = torrent.swarm._peersLength
        t.progress = torrent.progress
        t.timeRemaining = torrent.timeRemaining
      }
    }
  })

  return t
}

function getDate () {
  var date = new Date()
  return date.getDate() + '/' + (date.getMonth() + 1) + ' ' + (date.getHours() + 1) + ':' + (date.getMinutes() + 1) + ':' + (date.getSeconds() + 1)
}

function log (text) {
  console.log(text)
  fs.appendFile(CONFIG.LOGS, '[' + getDate() + '] ' + text + '\n', 'utf8', function (err) {
    if (err) throw err
  })
}
