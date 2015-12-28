
function appendDirectory(file){
	var $file = $('<tr>').addClass('file');
	if(file.alter == 1){
		$file.addClass('alter');
	}

	var $link = $('<a>').attr('href',"#"+document.location.hash.substring(1)+"/"+file.name).text(file.name.substring(0,30));
	var $name = $('<td>').addClass('name').html($link).appendTo($file);
	var $size = $('<td>').addClass('size').text(formatSize(file.size)).appendTo($file);
	var $date = $('<td>').addClass('date').text(formatDate(file.ctime)).appendTo($file);
	var $actions = $('<td>').addClass('actions');

	var $downloadBut = $('<i>').addClass('but fa fa-download').text('download').appendTo($actions);
	var $deleteBut = $('<i>').addClass('but fa fa-remove').text('delete').appendTo($actions);
	var $renameBut = $('<i>').addClass('but fa fa-pencil').text('rename').appendTo($actions);
	var $infoBut = $('<i>').addClass('but fa fa-info').text('infos').appendTo($actions);

	$actions.appendTo($file);

	$file.appendTo('.container .directory .list');
}
