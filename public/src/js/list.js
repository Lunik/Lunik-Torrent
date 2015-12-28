setInterval(listT, 1000);
setInterval(listD, 30000);

$(document).ready(initList);
$(window).bind('hashchange',listD).trigger('hashchange');

function initList(){
	listT();
	listD();
}
function listT(){
	socket.emit('list-t');
};

function listD(){
	var hash = document.location.hash.substring(1);
	socket.emit('list-d',hash);
}

function listTorrents(torrents){
	var i = 0;
	torrents.forEach(function(torrent){
		torrent.alter = i;
		appendTorrent(torrent);
		i = (i+1)%2;
	});
}

function listDirectory(directory){
	var i = 0;
	for(var key in directory){
		var file = directory[key];
		file.alter = i;
		file.name = key;
		appendDirectory(file);
		i = (i+1)%2;
	}
}