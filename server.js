var DEFAULTFILESPATH = __dirname + '/public/files/'
var DEFAULTDOWNLOADPATH = __dirname + '/public/downloads/'
var DEFAULTTORRENTPATH = __dirname + '/torrents.txt'
var DEFAULTLOGPATH = __dirname + '/log.txt'

// Setup basic express server
var auth = require('http-auth')
var basic = auth.basic({
  realm: 'Protected area. Please disperse !',
  file: __dirname + '/.htpasswd'
})

// file management
var fs = require('fs')
fs.writeFile(DEFAULTLOGPATH, '', 'utf-8', function (err) {
  if (err) throw err
})

var cp = require('child_process')

var express = require('express')
var app = express()
var compression = require('compression')
app.use(compression())
// Routing
app.use(express.static(__dirname + '/public'))
app.get('/files/', function (req, res) {
  var file = DEFAULTFILESPATH + req.query.f

  fs.stat(file, function (err, stats) {
    if (err) return log(err)
    var filename = file.split('/')[file.split('/').length - 1]

    fs.readFile(file, function (err, data) {
      if (err) return log(err)
      res.setHeader('Content-disposition', 'attachment; filename=' + filename)
      res.setHeader('Content-Length', stats.size)
      res.setHeader('Content-type', 'application/octet-stream')
      res.send(data)
    })

  })

})

// setup http server
var http = require('http')
http.globalAgent.maxSockets = Infinity
var server = http.createServer(basic, app)
var port = process.env.PORT || 80
server.listen(port, function () {
  log('Server listening at port ' + port)
})

// socket io
var io = require('socket.io')(server)

// Torrent memory tab
var TorrentUrlToChild = {}
var TorrentHashToChild = {}
var TorrentWaitList = []

// Auto start torrent in file
fs.writeFile(DEFAULTTORRENTPATH, '', 'utf-8', function (err) {
  if (err) throw err
})
setInterval(startPointTorrent, 30000)

io.on('connection', function (socket) {
  socket.on('ready', function () {
    for (var key in TorrentHashToChild) {
      TorrentHashToChild[key].send({'type': 'info'})
    }

    socket.on('download-t', function (url) {
      startTorrent(url)
    })
  })

  socket.on('list-d', function (dir) {
    fs.readdir(DEFAULTFILESPATH + dir, function (err, files) {
      if (err) return log(err)
      var list = {}
      if (files.length > 0) {
        files.forEach(function (file) {
          var stats = fs.statSync(DEFAULTFILESPATH + dir + file)
          if (stats.isFile()) {
            list[file] = stats
          } else {
            stats.size = sizeRecursif(DEFAULTFILESPATH + dir + file)
            list[file] = stats
          }
          list[file].isfile = stats.isFile()
          list[file].isdir = stats.isDirectory()

          if (Object.keys(list).length === files.length) {
            socket.emit('list-d', list)
          }
        })
      } else {
        socket.emit('list-d', {})
      }
    })
  })

  socket.on('remove-t', function (hash) {
    log('Remove torrent: ' + hash)
    TorrentHashToChild[hash].send({'type': 'remove'})
    socket.emit('finish-t', hash)
  })

  socket.on('remove-d', function (file) {
    log('Remove file: ' + file)
    fs.stat(DEFAULTFILESPATH + file, function (err, stats) {
      if (err) return log(err)
      if (stats.isDirectory()) {
        removeRecursif(DEFAULTFILESPATH + file)
        socket.emit('update-d')
      } else {
        fs.unlink(DEFAULTFILESPATH + file, function (err) {
          if (err) return log(err)
          socket.emit('update-d')
        })
      }
    })
  })

  socket.on('rename-d', function (data) {
    log('Rename: ' + data.oldname + ' In: ' + data.newname)
    fs.rename(DEFAULTFILESPATH + data.path + '/' + data.oldname, DEFAULTFILESPATH + data.path + '/' + data.newname, function (err) {
      if (err) return log(err)
      socket.emit('update-d')
    })
  })

  socket.on('mkdir', function (data) {
    log('Mkdir: ' + data.path + '/' + data.name)
    fs.mkdir(DEFAULTFILESPATH + data.path + '/' + data.name, function () {
      socket.emit('update-d')
    })
  })

  socket.on('mv', function (data) {
    fs.rename(DEFAULTFILESPATH + data.path + data.file, DEFAULTFILESPATH + data.path + data.folder + '/' + data.file, function (err) {
      if (err) return log(err)
      socket.emit('update-d')
    })
  })
})

function getDate () {
  var date = new Date()
  return date.getDate() + '/' + (date.getMonth() + 1) + ' ' + (date.getHours() + 1) + ':' + (date.getMinutes() + 1) + ':' + (date.getSeconds() + 1)
}

function log (text) {
  console.log(text)
  fs.appendFile(DEFAULTLOGPATH, '[' + getDate() + '] ' + text + '\n', 'utf8', function (err) {
    if (err) throw err
  })
}

function startTorrent (url) {
  log('Trying to download: ' + url)

  // evite de lancer deux fois le meme torrent
  if (TorrentUrlToChild[url] == null) {
    // Si trop de torrent en cours
    if (Object.keys(TorrentUrlToChild).length < 3) {
      var n = cp.fork(__dirname + '/tclient.js')
      TorrentUrlToChild[url] = n
      io.sockets.emit('start-t')
      n.on('message', function (data) {
        switch (data.type) {
          case 'finish':
            io.sockets.emit('finish-t', data.hash)
            n.kill('SIGHUP')
            delete TorrentUrlToChild[url]
            delete TorrentHashToChild[data.hash]
            fs.renameSync(DEFAULTDOWNLOADPATH + data.name, DEFAULTFILESPATH + data.name)
            // Relance un torrent si il y en a en attente
            if (TorrentWaitList.length > 0) {
              var newUrl = TorrentWaitList[0]
              startTorrent(newUrl)
              TorrentWaitList.shift()
            }
            break
          case 'info':
            io.sockets.emit('list-t', data.torrent)
            TorrentHashToChild[data.torrent.hash] = n
            break
          case 'remove':
            io.sockets.emit('finish-t', data.hash)
            n.kill('SIGHUP')
            delete TorrentUrlToChild[url]
            delete TorrentHashToChild[data.hash]
            fs.unlinkSync(DEFAULTDOWNLOADPATH + data.name)
            // Relance un torrent si il y en a en attente
            if (TorrentWaitList.length > 0) {
              startTorrent(TorrentWaitList[0])
              TorrentWaitList.shift()
            }
        }
      })

      n.send({'type': 'download', 'torrent': url})

    } else {
      log('Too much client. Adding torrent to the waitlist.')
      // On push dans la liste d'attente
      if (TorrentWaitList.indexOf(url) === -1)
        TorrentWaitList.push(url)
    }
  } else {
    log('Torrent is already downloading.')
  }
}

function removeRecursif (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        removeRecursif(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

function sizeRecursif (path) {
  var size = 0
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        sizeRecursif(curPath)
      } else { // read size
        size += fs.statSync(curPath).size
      }
    })
    return size
  }
}

function startPointTorrent () {
  log('Scan for new torrent.')
  fs.readFile(DEFAULTTORRENTPATH, 'utf-8', function (err, data) {
    if (err) return log(err)
    var torrents = data.split('\n')
    fs.writeFile(DEFAULTTORRENTPATH, '', 'utf-8', function (err) {
      if (err) return log(err)
      torrents.forEach(function (element) {
        if (element !== '') {
          startTorrent(element)
        }
      })
    })
  })
}
