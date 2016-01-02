$torrentInput = $('.menu input[name="torrent-link"]');
$startTorrentBut = $('.menu input[name="torrent-start"]');

$startTorrentBut.click(function(){
	if($torrentInput.val()){
		socket.emit('download-t',$torrentInput.val());
		$torrentInput.val("");
	}
})

function appendTorrent(torrent){
	if($('.torrent[hash='+torrent.hash+']').length > 0){
		var $torrent = $('.torrent[hash='+torrent.hash+']');
		$torrent.html('');
	} else {
		var $torrent = $('<tr>').addClass('torrent').attr('hash',torrent.hash);
	}

	if(torrent.alter == 1){
		$torrent.addClass('alter');
	}

	var $name = $('<td>').addClass('name').text(torrent.name.substring(0,30)).appendTo($torrent);
	var $size = $('<td>').addClass('size').text(formatSize(torrent.size)).appendTo($torrent);
	var $progress = $('<td>').addClass('progress').append(
		$('<progress>').attr('max',1).attr('value',torrent.progress),
		$('<p>').addClass('remaining-time').text(formatTime(torrent.timeRemaining))
	).appendTo($torrent);
	var $downspeed = $('<td>').addClass('sdown').text(formatSpeed(torrent.sdown)).appendTo($torrent);
	var $upspeed = $('<td>').addClass('sup').text(formatSpeed(torrent.sup)).appendTo($torrent);

	var $actions = $('<td>').addClass('actions');

	/*var $deleteBut = $('<i>').addClass('but fa fa-remove').attr('id','delete').text('delete').appendTo($actions).click(function(){
		socket.emit('remove-t',$(this).parent().parent().attr('hash'));
	});*/

	$actions.appendTo($torrent);

	$torrent.appendTo('.container .torrent .list');
}
