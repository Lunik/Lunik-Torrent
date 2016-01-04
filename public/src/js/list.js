$(window).bind('hashchange',initList).trigger('hashchange');
$(document).ready(function(){
	$('.container .directory .list tbody').tablesorter(); 
	$('.container .torrent .list tbody').tablesorter(); 
});

var DTimer;
function initList(){
	listD();
}

function listD(){
	var hash = document.location.hash.substring(1);
	socket.emit('list-d',hash);
	clearTimeout(DTimer)
	DTimer = setTimeout(listD, 1000);
	console.log('plop');
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