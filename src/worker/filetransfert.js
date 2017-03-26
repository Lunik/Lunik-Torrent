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
class FileTransfert {
  constructor (req, res, callback) {
    this.transfertNode(req, res, callback)
  }

/**
 * Transfert file with js support.
 * @param {object} req - http req object.
 * @param {object} res - http res object.
 * @param {callback} function - callback when transfert is complet.
 */
  transfertNode (req, res, callback) {
    var transfertNode = () => {
      var filename = Path.join(__base, `${__config.directory.path}${req.query.f}`)
      fs.stat(filename, (err, stats) => {
        if (err) {
          callback()
          res.end()
          LogWorker.error(err)
          return
        }
        if (stats) {
          res.download(filename, (err) => {
            if (err) {
              LogWorker.error(`${req.cookies.user} error during download file: ${req.query.f}\n${err}`)
              callback()

              res.status(500)
              res.end()
            } else {
              LogWorker.info(`${req.cookies.user} finish download file: ${req.query.f}`)
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
}
module.exports = FileTransfert
