
function formatSize(bytes){
	var sizes = ['b', 'kb', 'mb', 'gb', 'tb'];
   	if (bytes == 0) return '0 b';
   	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function formatSpeed(bytes){
	return formatSize(bytes)+"/s";
}

function formatDate(date){

	return date;
}

function formatTime(time){
	
	return time;
}