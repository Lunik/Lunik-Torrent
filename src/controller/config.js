'use strict'

var Path = require('path')
var express = require('express')
var router = express.Router()

/* var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
}) */

var packageFile = require(Path.join(__base, 'package.json'))
router.get('/version', function (req, res) {
  res.header('Content-Type', 'application/json')
  res.end(JSON.stringify({
    version: packageFile.version
  }))
})

module.exports = router
