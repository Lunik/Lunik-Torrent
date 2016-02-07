var Log = require('./log.js')
var Torrent = require('./torrent.js')
var Directory = require('./directory.js')
var config = require('./config.json')
var FileTransfert = require('./filetransfert.js')

var fs = require('fs')
var auth = require('http-auth')
var express = require('express')
var compression = require('compression')
var http = require('http')
var bodyParser = require('body-parser')

http.globalAgent.maxSockets = Infinity

function Server () {
  this.basic = auth.basic({
    realm: config.server.message,
    file: config.server.htpasswd
  })

  this.app = express()
  this.app.use(compression())
  this.app.use(express.static(__dirname + '/public'))
  this.app.use(bodyParser.json())
  this.app.use(bodyParser.urlencoded({ extended: true }))

  this.server = http.createServer(this.basic, this.app)
  this.server.listen(config.server.port, function () {
    Log.print('Server listening at port ' + config.server.port)
  })

  // Client Download file
  this.app.get('/files', function (req, res) {
    if(req.query.f){
      Log.print(req.user + ' download file: ' + req.query.f)
      Directory.setDownloading(req.query.f)
      var transfert = new FileTransfert(req, res, function(){
        Directory.finishDownloading(req.query.f)
      })
    } else {
      res.end("Le fichier n'existe pas")
    }
  })

  // client start torrent
  this.app.post('/download-t', function (req, res) {
    if (req.body.url) {
      Log.print(req.user + ' download torrent: ' + req.body.url)
      Torrent.start(req.body.url)
      res.end()
    } else {
      res.end()
    }
  })

  // client ask list of torrent active
  this.app.post('/list-t', function (req, res) {
    res.end(JSON.stringify(Torrent.info))
  })

  // client ask list of directory
  this.app.post('/list-d', function (req, res) {
    if (req.body.dir) {
      res.end(JSON.stringify(Directory.list(req.body.dir)))
    } else {
      res.end()
    }
  })

  // client remove torrent
  this.app.post('/remove-t', function (req, res) {
    if (req.body.hash) {
      Log.print(req.user + ' remove torrent: ' + req.body.hash)
      Torrent.remove(req.body.hash)
      res.end(req.body.hash)
    } else {
      res.end()
    }
  })

  // client remove directory / file
  this.app.post('/remove-d', function (req, res) {
    if (req.body.file) {
      Log.print(req.user + ' remove file: ' + req.body.file)
      Directory.remove(req.body.file)
      res.end(req.body.file)
    } else {
      res.end()
    }
  })

  // client rename file
  this.app.post('/rename-d', function (req, res) {
    if (req.body.path && req.body.oldname && req.body.newname) {
      Log.print(req.user + ' rename file: ' + req.body.path + req.body.oldname + ' in: ' + req.body.newname)
      Directory.rename(req.body.path, req.body.oldname, req.body.newname)
      res.end(JSON.stringify({path: req.body.path, oldname: req.body.oldname, newname: req.body.newname}))
    } else {
      res.end()
    }
  })

  // client create directory
  this.app.post('/mkdir-d', function (req, res) {
    if (req.body.path && req.body.name) {
      Log.print(req.user + ' create directory: ' + req.body.path + req.body.name)
      Directory.mkdir(req.body.path, req.body.name)
      res.end(req.body.name)
    } else {
      res.end()
    }
  })

  // client move directory
  this.app.post('/mv-d', function (req, res) {
    if (req.body.path && req.body.file && req.body.folder) {
      Log.print(req.user + ' move: ' + req.body.path + req.body.file + ' in: ' + req.body.path + req.body.folder)
      Directory.mv(req.body.path, req.body.file, req.body.folder)
      res.end(req.body.file)
    } else {
      res.end()
    }
  })

  this.app.post('/search-t', function (req, res) {
    if (req.body.query != '') {
      var searchEngine = require('./searchT.js')
      searchEngine.search(req.body.query, function (data) {
        res.end(JSON.stringify(data))
      })
    } else {
      var searchEngine = require('./searchT.js')
      searchEngine.latest(function (data) {
        res.end(JSON.stringify(data))
      })
    }
  })

  this.app.post('/info-d', function (req, res) {
    if (req.body.type && req.body.query) {
      var infoEngine = require('./mediaInfo.js')
      infoEngine.getInfo(req.body.type, req.body.query, function (data) {
        res.end(JSON.stringify(data))
      })
    } else (
      res.end()
      )

  })
}

var instServer = new Server()
module.exports = instServer
