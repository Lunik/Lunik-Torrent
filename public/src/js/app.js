$(document).ready(init);

var socket = io();

function init(){
	$.getScript('src/js/socket.js');

	$.getScript('src/js/list.js');
	$.getScript('src/js/file.js');
	$.getScript('src/js/torrent.js');
	$.getScript('src/js/directory.js');
}
