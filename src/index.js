'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Torrent = require(Path.join(__base, 'src/worker/torrent.js'))
var Directory = require(Path.join(__base, 'src/worker/directory.js'))
var FileTransfert = require(Path.join(__base, 'src/worker/filetransfert.js'))
var Auth = require(Path.join(__base, 'src/worker/auth.js'))
var SearchEngine = require(Path.join(__base, 'src/worker/searchT.js'))
var InfoEngine = require(Path.join(__base, 'src/worker/mediaInfo.js'))

Torrent.Directory = Directory

var Server = require(Path.join(__base, 'src/worker/server.js'))

var ServerWorker = new Server({
  Torrent: Torrent,
  Directory: Directory,
  FileTransfert: FileTransfert,
  Auth: Auth,
  SearchEngine: SearchEngine,
  InfoEngine: InfoEngine
})
