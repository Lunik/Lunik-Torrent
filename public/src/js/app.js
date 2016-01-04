$(document).ready(init);


var socket = io();

function init(){
	$.getScript('src/js/jquery.tablesorter.min.js').done(setTimeout(function(){
			$('.directory .list').tablesorter({
				// prevent text selection in header
				cancelSelection: true,

				// default setting to trigger a resort after an "update"
				resort: true,

				// initial sort order of the columns
				sortList: [ [0,0],[1,0] ],

				sortInitialOrder: "asc",
			});
		},1000));
	
	$.getScript('src/js/socket.js');

	$.getScript('src/js/list.js');
	$.getScript('src/js/file.js');
	$.getScript('src/js/torrent.js');
	$.getScript('src/js/directory.js');
}