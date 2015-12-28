// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;
var fs = require('fs');

var WebTorrent = require('webtorrent');
var client = new WebTorrent();

server.listen(port, function () {
  log('Server listening at port '+port);
});

// Routing
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

	socket.on('download',function(url){
		client.add(url, {path: __dirname+"/public/downloads/"}, function (torrent) {
		  	// Got torrent metadata!
		  	log('Server is downloading:'+torrent.name);

		  	torrent.on('done', function(){
	  			log('Server finish downloading:'+torrent.name);
	  			torrent.destroy();
			})

		  	socket.emit('download');
		});	
	});

	socket.on('list-t',function(){
		socket.emit('list-t',listTorrents());
	});

	socket.on('list-d',function(dir){
		fs.readdir(__dirname+"/public/downloads/"+dir, function(err, files){
			if(err) {
	        	return log(err);
	    	}
	    	var list = {};
	    	if(files.length > 0){
		    	files.forEach(function(file){
		    		fs.stat(__dirname+"/public/downloads/"+dir+file,function(err, stats){
		    			list[file] = stats;
		    			list[file].isfile = stats.isFile();
		    			list[file].isdir = stats.isDirectory()
		    			if(Object.keys(list).length == files.length){
		    				socket.emit('list-d',list);
		    			}
		    		});
		    	});
		    } else {
		    	socket.emit('list-d',{});
		    }
		});
	});

	socket.on('remove-d',function(file){
		fs.unlink(__dirname+"/public/downloads/"+file, function(err){
  			if (err) throw err;
			socket.emit('remove-d');
		});
	});

});

function log(text){
	console.log(text);
}

function listTorrents(){
	var torrents = [];
	client.torrents.forEach(function (torrent){
		var t = {};
		t.name = torrent.name;
		t.size = torrent.length;
		if(torrent.swarm){
			t.sdown = torrent.swarm.downloadSpeed();
			t.sup = torrent.swarm.uploadSpeed();
			t.down = torrent.swarm.downloaded;
			t.up = torrent.swarm.uploaded;
		}
		torrents.push(t);
	});

	return torrents;
}


