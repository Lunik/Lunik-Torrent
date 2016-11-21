'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  var Rand = require('crypto-rand')
  var Crypto = require('crypto-js')
  var token = Crypto.SHA256(Rand.rand().toString()).toString()

  var Database = require(Path.join(__base, 'src/database/server.js'))
  var DBPort = process.env.DB_PORT || __config.database.port
  var DB = new Database(DBPort, token)

  var i = 0;

  while (i < numCPUs) {
    cluster.fork();
    i++;
  }

  cluster.on('online', function(worker) {
    worker.send(token);
  });

  cluster.on("exit", function(worker, code, signal) {
    console.log("worker " + worker.process.pid + " died");
  });

} else {
  var Server = require(Path.join(__base, 'src/controller/main.js'))
  process.on('message', function(token) {
    global.__DBtoken = token
    var ServerWorker = new Server(cluster.worker.id)
  });
}
