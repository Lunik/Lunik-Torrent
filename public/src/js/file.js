
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
	//return date;
	var date = new Date(date);
	return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getMinutes();
}

function formatTime(time){
	var x = time / 1000
	var seconds = x % 60
	x /= 60
	var minutes = x % 60
	x /= 60
	var hours = x % 24
	x /= 24
	var days = x

	return Math.round(days)+"j "+Math.round(hours)+":"+Math.round(minutes)+":"+Math.round(seconds);
}