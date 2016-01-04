var socket = io();

socket.on('update-t',function(){
	listT();
});

socket.on('finish-t',function(hash){
	$('.torrent[hash='+hash+']').remove();
});

socket.on('list-t',function(torrents){
	listTorrent(torrents);
});

socket.on('list-d',function(directory){
	$('.container .directory .list tbody').html("");
	listDirectory(directory);
});

socket.on('update-d',function(){
	listD();
});