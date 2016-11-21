'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Datastore = require('nedb')

global.__DB = {
  invitation: new Datastore({ filename: Path.join(__base, 'data/invitation.db') }),
  user: new Datastore({ filename: Path.join(__base, 'data/password.db') }),
  torrent: new Datastore({ filename: Path.join(__base, 'data/torrent.db') }),
  directory: new Datastore({ filename: Path.join(__base, 'data/directory.db') })
}

for(var key in global.__DB){
  global.__DB[key].loadDatabase()
}
var Server = require(Path.join(__base, 'src/controller/main.js'))

var ServerWorker = new Server()
