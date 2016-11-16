var Path = require('path')
var express = require('express')
var router = express()

var Directory = require(Path.join(__base, 'src/worker/directory'))
var FileTransfert = require(Path.join(__base, 'src/worker/filetransfert'))
var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
})

// Client Download file
router.get('/files', function (req, res) {
  if (req.query.f) {
    req.query.f = req.query.f.split('..').join('')
    LogWorker.info(`${req.cookies.user} download file: ${req.query.f}`)
    Directory.setDownloading(req.query.f)
    var transfert = new FileTransfert(req, res, function () {
      Directory.finishDownloading(req.query.f)
    })
  } else {
    res.end(JSON.stringify({
      err: "File doesn't exist."
    }))
  }
})

module.exports = router
