'use strict'

var express = require('express')
var compression = require('compression')
var bodyParser = require('body-parser')
var Datastore = require('nedb')
var Path = require('path')

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'DatabaseServer'
})

function parseJSON (json) {
  json = JSON.stringify(json)
  return JSON.parse(json, (k, v) => {
    return (typeof v === 'object' || isNaN(v) || v === '') ? v : parseFloat(v, 10)
  })
}

class DatabaseServer {
  constructor (port, token) {
    this.token = token
    this.databases = {}

    this.app = express()
    this.app.use(compression())

    this.app.use(bodyParser.urlencoded({
      extended: true
    }))

    this.app.listen(port, '127.0.0.1', () => {
      LogWorker.info(`Database listening at port ${port}`)
    })

    this.app.use((request, response, next) => {
      if (request.headers.authorization === this.token) {
        next()
      } else {
        response.status(403)
        response.end()
      }
    })

    this.app.get('/api/find', (request, response) => {
      var query = parseJSON(request.query)
      this.loadDB(query.__database, () => {
        var db = query.__database
        delete query.__database

        this.databases[db].find(query || {}, (err, res) => {
          response.end(JSON.stringify({
            err: err ? err.toString() : '',
            data: res
          }))
        })
      })
    })
    this.app.post('/api/insert', (request, response) => {
      var body = parseJSON(request.body)
      this.loadDB(body.__database, () => {
        var db = body.__database
        delete body.__database

        this.databases[db].insert(body || {}, (err) => {
          response.end(JSON.stringify({
            err: err ? err.toString() : ''
          }))
        })
      })
    })
    this.app.post('/api/update', (request, response) => {
      var body = parseJSON(request.body)
      this.loadDB(body.__database, () => {
        var db = body.__database
        delete body.__database

        this.databases[db].update(body.query || {},
        body.data || {},
        body.options || {}, (err) => {
          response.end(JSON.stringify({
            err: err ? err.toString() : ''
          }))
        })
      })
    })
    this.app.post('/api/remove', (request, response) => {
      var body = parseJSON(request.body)
      this.loadDB(body.__database, () => {
        var db = body.__database
        delete body.__database

        this.databases[db].remove(body.query || {},
        body.options || {}, (err) => {
          response.end(JSON.stringify({
            err: err ? err.toString() : ''
          }))
        })
      })
    })
  }

  loadDB (db, cb) {
    if (this.databases[db] == null) {
      this.databases[db] = new Datastore({ filename: Path.join(__base, `data/${db}.db`) })
      this.databases[db].loadDatabase(cb)
      this.databases[db].persistence.compactDatafile()
    } else {
      cb()
    }
  }
}
module.exports = DatabaseServer
