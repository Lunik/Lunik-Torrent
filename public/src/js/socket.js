socket.on('download',function(){

});

socket.on('list',function(torrents){
	$('.container .list tbody').html("");
	var i = 0;
	torrents.forEach(function(torrent){
		torrent.alter = i;
		appendTorrent(torrent);
		i = (i+1)%2;
	});
});