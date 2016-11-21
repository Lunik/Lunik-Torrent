'use strict'

var express = require('express')
var compression = require('compression')
var bodyParser = require('body-parser')
var Datastore = require('nedb')
var Path = require('path')

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'DatabaseServer'
})

function DatabaseServer(port, token){
  var self = this
  self.token = token
  this.databases = {}

  this.app = express()
  this.app.use(compression())
  this.app.use(bodyParser.json())
  this.app.use(bodyParser.urlencoded({
    extended: true
  }))

  this.app.listen(port, '127.0.0.1', function () {
    LogWorker.info(`Database listening at port ${port}`)
  })

  this.app.use(function(request, response, next){
    if(request.headers.authorization == self.token){
      next()
    } else {
      response.status(403)
      response.end()
    }
  })

  this.app.get('/api/find', function(request, response){
    self.loadDB(request.query.__database, function(){
      var db = request.query.__database
      delete request.query.__database
      self.databases[db].find(request.query || {}, function(err, res){
          response.end(JSON.stringify({
            err: err ? err.toString() : "",
            data: res
          }))
      })
    })
  })
  this.app.post('/api/insert', function(request, response){
    self.loadDB(request.body.__database, function(){
      var db = request.body.__database
      delete request.body.__database
      self.databases[db].insert(request.body || {}, function(err){
          response.end(JSON.stringify({
            err: err ? err.toString() : ""
          }))
      })
    })
  })
  this.app.post('/api/update', function(request, response){
    self.loadDB(request.body.__database, function(){
      var db = request.body.__database
      delete request.body.__database
      for(var element in request.body.data.$inc){
        request.body.data.$inc[element] = parseInt(request.body.data.$inc[element])
      }
      self.databases[db].update(request.body.query || {},
        request.body.data || {},
        request.body.options || {}, function(err){
          response.end(JSON.stringify({
            err: err ? err.toString() : ""
          }))
      })
    })
  })
  this.app.post('/api/remove', function(request, response){
    self.loadDB(request.body.__database, function(){
      var db = request.body.__database
      delete request.body.__database
      self.databases[db].remove(request.body.query || {},
        request.body.options || {}, function(err){
          response.end(JSON.stringify({
            err: err ? err.toString() : ""
          }))
      })
    })
  })
}

DatabaseServer.prototype.loadDB = function(db, cb){
  if(this.databases[db] == null){
    this.databases[db] = new Datastore({ filename: Path.join(__base, `data/${db}.db`) })
    this.databases[db].loadDatabase(cb)
  } else {
    cb()
  }
}
module.exports = DatabaseServer
