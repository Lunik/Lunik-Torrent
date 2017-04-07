'use strict'
var fs = require('fs')
var Path = require('path')

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'FileTransfert'
})

/**
 * File transfert server.
 * @constructor
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
function FileTransfert (req, res, file, callback) {
  var self = this
  self.transfertNode(req, res, file, callback)
}

/**
 * Transfert file with js support.
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
FileTransfert.prototype.transfertNode = function (req, res, file, callback) {
  var transfertNode = function () {
    var filename = Path.join(__base, `${__config.directory.path}${file}`)
    fs.stat(filename, function (err, stats) {
      if (err) {
        callback()
        res.end()
        LogWorker.error(err)
        return
      }
      if (stats) {
        res.download(filename, function (err) {
          if (err) {
            LogWorker.error(`${req.cookies.user} error during download file: ${file}
 ${err}`)
            callback()

            res.status(500)
            res.end()
          } else {
            LogWorker.info(`${req.cookies.user} finish download file: ${file}`)
            callback()

            res.end()
          }
        })
      } else {
        res.status(404)
        res.end("Le fichier n'existe pas.")
      }
    })
  }

  setTimeout(transfertNode)
}

module.exports = FileTransfert
