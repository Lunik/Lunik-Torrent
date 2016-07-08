var config = require('../configs/config.json')
var Log = require('./log.js')

var fs = require('fs')
var portscanner = require('portscanner')
var Path = require('path')

/**
 * File transfert server.
 * @constructor
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
function FileTransfert (req, res, callback) {
  var self = this
  setTimeout(function () {
    if (config.nginx.active) {
      portscanner.checkPortStatus(config.nginx.port, 'localhost', function (error, status) {
        if (error) {
          console.log(error)
        }
        // Nginx aviable
        if (status === 'open') {
          self.transfertNginx(req, res, callback)
        } else {
          Log.print('Nginx unaviable for download.')
          self.transfertNode(req, res, callback)
        }
      })
    } else {
      self.transfertNode(req, res, callback)
    }

    self.timeout = 0
  }, 1)
}

/**
 * Transfert file with js support.
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
FileTransfert.prototype.transfertNode = function (req, res, callback) {
  setTimeout(function () {
    var filename = Path.join(config.directory.path + req.query.f)
    fs.stat(filename, function (err, stats) {
      if (err) {
        console.log(err)
      }
      if (stats) {
        res.setHeader('Content-disposition', 'attachment; filename="' + req.query.f.split('/').pop() + '"')
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
  }, 1)
}

/**
 * Transfert file with nginx server.
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
FileTransfert.prototype.transfertNginx = function (req, res, callback) {
  // Execute callback after 1h
  setTimeout(function () {
    callback()
  }, 3600000)
  res.redirect(Path.join('http://', req.headers['host'], ':', config.nginx.port, config.nginx.path, req.query.f))
}
module.exports = FileTransfert
