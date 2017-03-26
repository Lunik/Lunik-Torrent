'use strict'

var express = require('express')
var compression = require('compression')
var bodyParser = require('body-parser')
var Datastore = require('nedb')
var Path = require('path')

var Log = require(Path.join(__base, __workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'DatabaseServer'
})

function parseJSON (json) {
  json = JSON.stringify(json)
  return JSON.parse(json, function (k, v) {
    return (typeof v === 'object' || isNaN(v) || v === '') ? v : parseFloat(v, 10)
  })
}

function DatabaseServer (port, token) {
  var self = this
  self.token = token
  this.databases = {}

  this.app = express()
  this.app.use(compression())

  this.app.use(bodyParser.urlencoded({
    extended: true
  }))

  this.app.listen(port, '127.0.0.1', function () {
    LogWorker.info(`Database listening at port ${port}`)
  })

  this.app.use(function (request, response, next) {
    if (request.headers.authorization == self.token) {
      next()
    } else {
      response.status(403)
      response.end()
    }
  })

  this.app.get('/api/find', function (request, response) {
    var query = parseJSON(request.query)
    self.loadDB(query.__database, function () {
      var db = query.__database
      delete query.__database

      self.databases[db].find(query || {}, function (err, res) {
        response.end(JSON.stringify({
          err: err ? err.toString() : '',
          data: res
        }))
      })
    })
  })
  this.app.post('/api/insert', function (request, response) {
    var body = parseJSON(request.body)
    self.loadDB(body.__database, function () {
      var db = body.__database
      delete body.__database

      self.databases[db].insert(body || {}, function (err) {
        response.end(JSON.stringify({
          err: err ? err.toString() : ''
        }))
      })
    })
  })
  this.app.post('/api/update', function (request, response) {
    var body = parseJSON(request.body)
    self.loadDB(body.__database, function () {
      var db = body.__database
      delete body.__database

      self.databases[db].update(body.query || {},
        body.data || {},
        body.options || {}, function (err) {
          response.end(JSON.stringify({
            err: err ? err.toString() : ''
          }))
        })
    })
  })
  this.app.post('/api/remove', function (request, response) {
    var body = parseJSON(request.body)
    self.loadDB(body.__database, function () {
      var db = body.__database
      delete body.__database

      self.databases[db].remove(body.query || {},
        body.options || {}, function (err) {
          response.end(JSON.stringify({
            err: err ? err.toString() : ''
          }))
        })
    })
  })
}

DatabaseServer.prototype.loadDB = function (db, cb) {
  if (this.databases[db] == null) {
    this.databases[db] = new Datastore({ filename: Path.join(__base, `data/${db}.db`) })
    this.databases[db].loadDatabase(cb)
    this.databases[db].persistence.compactDatafile()
  } else {
    cb()
  }
}
module.exports = DatabaseServer
