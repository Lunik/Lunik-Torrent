var WebTorrent = require('webtorrent');
var client = new WebTorrent();
process.on('message', function(data) {
	switch(data.type){
		case 'download':
			console.log('CHILD start:', data.torrent);
			client.add(data.torrent, {path: __dirname+"/public/downloads/"}, function (torrent) {
				// Got torrent metadata!
				console.log("Start torrent: "+torrent.name);

				torrent.on('done', function(){
			  			console.log("Finish torrent: "+torrent.name);
			  			torrent.destroy();
			  			process.send({'type':"finish",'hash':torrent.infoHash});
				});
			});	
			break;

		case 'info':
			process.send({'type':"info", 'torrent': listTorrents()})
			break;
	}
});

function listTorrents(){
	var torrents = [];
	client.torrents.forEach(function (torrent){
		if(!torrent.client.destroyed){
			var t = {};
			t.name = torrent.name;
			t.size = torrent.length;
			if(torrent.swarm){
				t.hash = torrent.infoHash;
				t.sdown = torrent.swarm.downloadSpeed();
				t.sup = torrent.swarm.uploadSpeed();
				t.down = torrent.swarm.downloaded;
				t.up = torrent.swarm.uploaded;
				t.progress = torrent.progress;
				t.timeRemaining = torrent.timeRemaining;
			}
			torrents.push(t);
		}
	});

	return torrents;
}