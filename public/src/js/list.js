$(window).bind('hashchange',initList).trigger('hashchange');

function initList(){
	listD();
}

function listD(){
	var hash = document.location.hash.substring(1);
	socket.emit('list-d',hash);
	setTimeout(listD, 30000);
}

function listTorrent(torrent){
	appendTorrent(torrent);
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