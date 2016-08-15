'use strict'
var fs = require('fs')
var portscanner = require('portscanner')
var Path = require('path')

var Log = require(Path.join(__base, 'src/log.js'))

/**
 * File transfert server.
 * @constructor
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
function FileTransfert (req, res, callback) {
  var self = this
  self.transfertNode(req, res, callback)
}

/**
 * Transfert file with js support.
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
FileTransfert.prototype.transfertNode = function (req, res, callback) {
  setTimeout(function () {
    var filename = Path.join(__base, __config.directory.path + req.query.f)
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

module.exports = FileTransfert
