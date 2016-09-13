'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Update = require(Path.join(__base, 'src/worker/update.js'))
var UpdateWorker = new Update(function () {
  var Server = require(Path.join(__base, 'src/worker/server.js'))
})
