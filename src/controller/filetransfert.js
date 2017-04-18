var Path = require('path')
var Crypto = require('crypto-js')

var Directory = require(Path.join(__workingDir, 'worker/directory'))
var FileTransfert = require(Path.join(__workingDir, 'worker/filetransfert'))
var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
})

function Router (app) {
// Client Download file
  app.get('/files', function (req, res) {
    if (req.query.f) {
      req.query.f = req.query.f.split('..').join('')
      LogWorker.info(`${req.cookies.user} download file: ${req.query.f}`)
      DL(req, res, req.query.f)
    } else {
      res.end(JSON.stringify({
        err: "File doesn't exist."
      }))
    }
  })

  app.get('/directdl/:file(*)', function (req, res) {
    if (req.params.file) {
      var file = Crypto.AES.decrypt(req.params.file, '').toString(Crypto.enc.Utf8)
      LogWorker.info(`${req.cookies.user} download file: ${file}`)
      DL(req, res, file)
    } else {
      res.end(JSON.stringify({
        err: "File doesn't exist."
      }))
    }
  })
}

function DL(req, res, file){
  Directory.setDownloading(file, function (err) {
    if (err) {
      LogWorker.error(err)
      res.end()
    } else {
      var transfert = new FileTransfert(req, res, file, function () {
        Directory.finishDownloading(file, function (err) {
          if (err) {
            LogWorker.error(err)
          }
        })
      })
    }
  })
}
module.exports = Router
