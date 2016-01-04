$(window).bind('hashchange',initList).trigger('hashchange');

var DTimer;
function initList(){
	filAriane();
	listD(); 
}

function listD(){
	var hash = document.location.hash.substring(1);
	socket.emit('list-d',hash);
	clearTimeout(DTimer)
	DTimer = setTimeout(listD, 30000);
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

function filAriane(){
	var $ariane = $('.directory .fil-ariane').html("");
	var $delimiter = $('<span>').addClass('delimiter').text(">");

	var $home = $('<a>').attr('href','#').text("Home").appendTo($ariane);

	var directories = document.location.hash.substring(1).split('/');
	var profDir = "";
	directories.forEach(function(dir){
		if(dir != ""){
			$ariane.append($delimiter.clone());
			profDir += dir+"/";
			$('<a>').attr('href','#'+profDir).text(dir).appendTo($ariane);
		}
	});
	
}