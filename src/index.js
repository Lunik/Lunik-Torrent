'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Server = require(Path.join(__base, 'src/controller/main.js'))

var cluster = require("cluster");

var numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  var i = 0;

  while (i < numCPUs) {
    cluster.fork();
    i++;
  }

  cluster.on("exit", function(worker, code, signal) {
    console.log("worker " + worker.process.pid + " died");
    cluster.fork();
  });
} else {
  var ServerWorker = new Server(cluster.worker.id)
}
