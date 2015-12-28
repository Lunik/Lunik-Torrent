// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5002;

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
	  		console.log('Server is downloading:', torrent.name);

	  		torrent.on('done', function(){
  				console.log('Server finish downloading:',torrent.name);
  				torrent.destroy();
			})

	  		socket.emit('download');
		});
	});

	socket.on('list',function(){
		var torrents = [];
		client.torrents.forEach(function (torrent){
			var t = {};
			t.name = torrent.name;
			t.size = torrent.length;
			t.sdown = torrent.swarm.downloadSpeed();
			t.sup = torrent.swarm.uploadSpeed();
			t.down = torrent.swarm.downloaded;
			t.up = torrent.swarm.uploaded;

			torrents.push(t);
		});
		socket.emit('list',torrents);
	});
});


function log(text){
	console.log(text);
}
