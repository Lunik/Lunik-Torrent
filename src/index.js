'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var cluster = require('cluster')
var numCPUs = require('os').cpus().length

var Rand = require('crypto-rand')
var Crypto = require('crypto-js')
var token = Crypto.SHA256(Rand.rand().toString()).toString()
global.__DBtoken = token

var Database = require(Path.join(__base, 'src/database/server.js'))
var DBPort = process.env.DB_PORT || __config.database.port
var DB = new Database(DBPort, token)

var Server = require(Path.join(__base, 'src/controller/main.js'))
var ServerWorker = new Server()
