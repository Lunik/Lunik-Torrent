'use strict'

var Path = require('path')
var fs = require('fs')
var express = require('express')
var router = express.Router()

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Logs'
})

router.get('/logs', (req, res) => {
  res.header('Content-Type', 'text/plain')
  fs.readFile(LogWorker.getFile(), (err, text) => {
    if (err) {
      LogWorker.error(err)
    }
    var cleanText = text.toString()
      .replace(/(login from) .*/g, '$1 ***.***.***.***')
      .replace(/(listening at port) .*/g, '$1 ****')
    res.end(cleanText)
  })
})

module.exports = router
