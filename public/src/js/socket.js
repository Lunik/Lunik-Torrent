socket.on('download',function(){
	console.log("ok");
});

socket.on('list-t',function(torrents){
	$('.container .torrent .list tbody').html("");
	listTorrents(torrents);
});

socket.on('list-d',function(directory){
	$('.container .directory .list tbody').html("");
	listDirectory(directory);
});