'use strict'
// launch the server

var Path = require('path')

global.__base = Path.join(__dirname, '..', '/')

var Config = require(Path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(Path.join(__base, 'configs/config.json'))

var Update = require(Path.join(__base, 'src/worker/update.js'))
var Log = require(Path.join(__base, 'src/worker/log.js'))

var Etcd = require('etcd-node/src/server')
var EtcdWorker = new Etcd({
	host: __config.etcd.host,
	port: __config.etcd.port,
	savePath: Path.join(__base, 'data', 'etcd.json')
})

EtcdWorker.start(function(host, port){
	Log.print('Etcd listening on ' + host +':'+port)

	setInterval(function(){
		EtcdWorker.save(function(err){
			if(err) {
				Log.print(err)
			}
		})
	}, 1000)

	var Server = require(Path.join(__base, 'src/worker/server.js'))

	// this function is called when you want the server to die gracefully
	// i.e. wait for existing connections
	var gracefulShutdown = function () {
	  Server.server.close(function () {
	    process.exit()
	  })

	  // if after
	  setTimeout(function () {
	    process.exit()
	  }, 10 * 1000)
	}

	// listen for TERM signal .e.g. kill
	process.on('SIGTERM', gracefulShutdown)

	// listen for INT signal e.g. Ctrl-C
	process.on('SIGINT', gracefulShutdown)
})
