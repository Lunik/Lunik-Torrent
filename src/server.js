var Log = require('./log.js')

var fs = require('fs')
var auth = require('http-auth')
var express = require('express')
var compression = require('compression')
var http = require('http')

http.globalAgent.maxSockets = Infinity

function Server () {
  this.config = require('./config.json')

  this.basic = auth.basic({
    realm: this.config.server.message,
    file: this.config.server.htpasswd
  })

  this.app = express()
  this.app.use(compression())
  this.app.use(express.static(__dirname + '/public'))

  this.app.get('/files/', function (req, res) {
    var filename = instServer.config.directory.path + req.query.f
    Log.print(req.user + ' download: ' + req.query.f)
    fs.stat(filename, function (err, stats) {
      if (stats) {
        res.setHeader('Content-disposition', 'attachment; filename="' + req.query.f.split("\/").pop() + '"')
        res.setHeader('Content-Length', stats.size)
        res.setHeader('Content-type', 'application/octet-stream')
        var fReadStream = fs.createReadStream(filename)
        fReadStream.pipe(res)
      } else {
        res.end("Le fichier n'existe pas")
      }
    })
  })

  this.server = http.createServer(this.basic, this.app)
  this.server.listen(this.config.server.port, function () {
    Log.print('Server listening at port ' + instServer.config.server.port)
  })
}

var instServer = new Server()
module.exports = instServer
