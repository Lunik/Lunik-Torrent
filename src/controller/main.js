'use strict'

var express = require('express')
var compression = require('compression')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var Path = require('path')
var https = require('https')
var fs = require('fs')

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
})

/**
 * Deserve http requests.
 * @constructor
*/
function Server (id) {
  var port = process.env.PORT || __config.server.port
  var sslport = __config.server.https

  this.app = express()
  this.app.use(compression())
  this.app.use(cookieParser())
  this.app.use(bodyParser.json())
  this.app.use(bodyParser.urlencoded({
    extended: true
  }))

  if (sslport) {
    this.app.use(function (req, res, next) {
      if (!req.secure) {
        res.redirect(`https://${req.headers['host']}`)
      }
    })
  }
  this.app.use(require(Path.join(__workingDir, 'controller/auth.js')))
  this.app.use(require(Path.join(__workingDir, 'controller/config.js')))
  this.app.use(require(Path.join(__workingDir, 'controller/filetransfert')))
  this.app.use(require(Path.join(__workingDir, 'controller/torrent')))
  this.app.use(require(Path.join(__workingDir, 'controller/directory')))
  this.app.use(require(Path.join(__workingDir, 'controller/logs')))

  this.app.use(express.static(Path.join(__workingDir, 'public')))

  if (sslport) {
    var options = {
      key: fs.readFileSync(__config.server.certs.privatekey),
      cert: fs.readFileSync(__config.server.certs.certificate)
    }

    this.server = https.createServer(options, this.app).listen(sslport, function () {
      LogWorker.info(`Server ${id} listening at port ${sslport}`)
    })
  }
  this.app.listen(port, function () {
    LogWorker.info(`Server ${id} listening at port ${port}`)
  })
}

module.exports = Server
