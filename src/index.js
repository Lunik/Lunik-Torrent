'use strict'
// launch the server

var Rand = require('crypto-rand')
var Path = require('path')
var Crypto = require('crypto-js')

global.__base = Path.join(__dirname, '..', '/')

if (__dirname.match(/([^/]*\/)*\/build/g)) {
  global.__workingDir = Path.join(__base, 'build')
} else {
  global.__workingDir = Path.join(__base, 'src')
}

var Config = require(Path.join(__workingDir, 'worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Server = require(Path.join(__workingDir, 'controller/main.js'))
var Database = require(Path.join(__workingDir, 'database/server.js'))
var DBPort = process.env.DB_PORT || __config.database.port
var token, DB

if (__config.server.duplication > 1) {
  var cluster = require('cluster')
  var numCPUs = require('os').cpus().length

  if (cluster.isMaster) {
    token = Crypto.SHA256(Rand.rand().toString()).toString()

    DB = new Database(DBPort, token)

    cluster.schedulingPolicy = cluster.SCHED_RR
    var i = 0
    while (i < numCPUs && i < __config.server.duplication) {
      cluster.fork()
      i++
    }

    cluster.on('online', (worker) => {
      worker.send(token)
    })

    cluster.on('exit', (worker, code, signal) => {
      console.log('Worker ' + worker.process.pid + ' died')
      cluster.fork()
    })
  } else {
    process.on('message', (token) => {
      global.__DBtoken = token
      var ServerWorker = new Server(cluster.worker.id)
    })
  }
} else {
  token = Crypto.SHA256(Rand.rand().toString()).toString()

  DB = new Database(DBPort, token)

  global.__DBtoken = token
  var ServerWorker = new Server(1)
}
