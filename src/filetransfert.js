var config = require('./config.json')
var Log = require('./log.js')

var fs = require('fs')
var portscanner = require('portscanner')

function FileTransfert (req, res, callback) {
  var self = this
  if (config.nginx.active) {
    portscanner.checkPortStatus(config.nginx.port, 'localhost', function (error, status) {
      // Nginx aviable
      if (status === 'open') {
        self.transfertNginx(req, res, callback)
      } else {
        Log.print('Nginx unaviable for download.')
        self.transfertNode(req, res, callback)
      }
    })
  } else {
    this.transfertNode(req, res, callback)
  }

  this.timeout = 0
}

FileTransfert.prototype.transfertNode = function (req, res, callback) {
  var filename = config.directory.path + req.query.f
  var self = this
  fs.stat(filename, function (err, stats) {
    if (stats) {
      res.setHeader('Content-disposition', 'attachment; filename="' + req.query.f.split('\/').pop() + '"')
      res.setHeader('Content-Length', stats.size)
      res.setHeader('Content-type', 'application/octet-stream')

      var fReadStream = fs.createReadStream(filename)

      fReadStream.pipe(res)
      fReadStream.on('end', function () {
        Log.print(req.user + ' finish download file: ' + req.query.f)
        callback()

        res.end()
      })
      fReadStream.on('close', function () {
        Log.print(req.user + ' stop download file: ' + req.query.f)
        callback()

        res.end()
      })
      fReadStream.on('error', function (err) {
        Log.print(req.user + ' error during download file: ' + req.query.f + '\n err: ' + err)
        callback()

        res.end()
      })
    } else {
      res.end("Le fichier n'existe pas")
    }
  })
}

FileTransfert.prototype.transfertNginx = function (req, res, callback) {
  // Execute callback after 1h
  setTimeout(function () {
    callback()
  }, 3600000)
  res.redirect('http://' + req.headers['host'] + ':' + config.nginx.port + '/' + config.nginx.path + '/' + req.query.f)
}
module.exports = FileTransfert
