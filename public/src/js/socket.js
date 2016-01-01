socket.on('update-t',function(){
	listT();
});

socket.on('finish-t',function(hash){
	$('.torrent[hash='+hash+']')
});

socket.on('list-t',function(torrents){
	setTimeout(listT, 3000);
	listTorrents(torrents);
});

socket.on('list-d',function(directory){
	setTimeout(listD, 30000);
	listDirectory(directory);
});

socket.on('update-d',function(){
	listD();
});

socket.on('update-t',function(){
	listT();
});