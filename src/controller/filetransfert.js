var Path = require('path')
var express = require('express')
var router = express()

var Directory = require(Path.join(__workingDir, 'worker/directory'))
var FileTransfert = require(Path.join(__workingDir, 'worker/filetransfert'))
var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
})

// Client Download file
router.get('/files', (req, res) => {
  if (req.query.f) {
    req.query.f = req.query.f.split('..').join('')
    LogWorker.info(`${req.cookies.user} download file: ${req.query.f}`)
    Directory.setDownloading(req.query.f, (err) => {
      if (err) {
        LogWorker.error(err)
        res.end()
      } else {
        var transfert = new FileTransfert(req, res, () => {
          Directory.finishDownloading(req.query.f, (err) => {
            if (err) {
              LogWorker.error(err)
            }
          })
        })
      }
    })
  } else {
    res.end(JSON.stringify({
      err: "File doesn't exist."
    }))
  }
})

module.exports = router
