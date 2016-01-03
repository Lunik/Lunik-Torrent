
function appendDirectory(file){
	var $file = $('<tr>').addClass('file');
	if(file.alter == 1){
		$file.addClass('alter');
	}

	var $name = $('<td>').addClass('name').html(
		file.isdir ? 
		$('<a>').attr('href', "#"+document.location.hash.substring(1)+"/"+file.name+"/").text(file.name.substring(0,30)) :
		file.name.substring(0,30)).appendTo($file);
	var $size = $('<td>').addClass('size').text(formatSize(file.size)).appendTo($file);
	var $date = $('<td>').addClass('date').text(formatDate(file.ctime)).appendTo($file);
	var $actions = $('<td>').addClass('actions');

	if(file.isfile){
		var $downloadBut = $('<i>').addClass('but fa fa-download').attr('id','download').text('download').appendTo($actions).click(function(){
			window.open("downloads/"+document.location.hash.substring(1)+"/"+file.name);
		});
	}
	var $deleteBut = $('<i>').addClass('but fa fa-remove').attr('id','delete').text('delete').appendTo($actions).click(function(){
		socket.emit('remove-d',document.location.hash.substring(1)+"/"+file.name);
	});
	var $renameBut = $('<i>').addClass('but fa fa-pencil').attr('id','rename').text('rename').appendTo($actions).click(function(){
		var name = prompt('New Name',file.name);
		name = name.split('\/').pop();
		if(name){
			socket.emit('rename-d',{
				'path': document.location.hash.substring(1), 
				'oldname':file.name,
				'newname':name
			});
		}
	});
	if(file.isfile){
		var $infoBut = $('<i>').addClass('but fa fa-info').attr('id','info').text('infos').appendTo($actions);
	}	

	$actions.appendTo($file);

	$file.appendTo('.container .directory .list');
}
