function appendDirectory(file) {
  var $file = $('<tr>').addClass('file')
  if (file.alter == 1) {
    $file.addClass('alter')
  }

  var $name = $('<td>').addClass('name').attr('id', getExtention(file)).attr('data-file', file.name).html(
    file.isdir ?
    $('<a>').attr('href', '#' + document.location.hash.substring(1) + file.name + '/').text(file.name.substring(0, 50)) :
    file.name.substring(0, 30)).appendTo($file)
  if (file.isfile)
    $name.draggable({
      revert: true
    })
  else
    $name.droppable({
      greedy: true,
      drop: function(data) {
        var folder = $(this).attr('data-file')
        var file = $(data.toElement).attr('data-file')
        var path = document.location.hash.substring(1)

        socket.emit('mv', {
          'file': file,
          'path': path,
          'folder': folder
        })
      }
    })

  var $size = $('<td>').addClass('size').text(formatSize(file.size)).appendTo($file)
  var $date = $('<td>').addClass('date').text(formatDate(file.ctime)).appendTo($file)
  var $actions = $('<td>').addClass('actions')

  if (file.isfile) {
    var $downloadBut = $('<i>').addClass('but fa fa-download').attr('id', 'download').text('download').appendTo($actions).click(function() {
      window.open('files/?f=' + document.location.hash.substring(1) + '/' + file.name)
    })
  }
  var $deleteBut = $('<i>').addClass('but fa fa-remove').attr('id', 'delete').text('delete').appendTo($actions).click(function() {
    if (confirm('Confirmer la suppression ?'))
      socket.emit('remove-d', document.location.hash.substring(1) + '/' + file.name)
  })
  var $renameBut = $('<i>').addClass('but fa fa-pencil').attr('id', 'rename').text('rename').appendTo($actions).click(function() {
    var name = prompt('New Name', file.name)
    if (name) {
      name = name.split('\/').pop()
      socket.emit('rename-d', {
        'path': document.location.hash.substring(1),
        'oldname': file.name,
        'newname': name
      })
    }
  })
  if (file.isfile) {
    var $infoBut = $('<i>').addClass('but fa fa-info').attr('id', 'info').text('infos').appendTo($actions).click(function(){
      var title = $($(this).parent().parent().children()[0]).text()
      var type = getMediaType(title)
      title = cleanTitle(title)
      socket.emit('infos-d', {type:type, query:title})
    })
  }

  $actions.appendTo($file)

  $file.appendTo('.container .directory .list')
}

function appendDirectorySize(size) {
  $('.folder-size').text(formatSize(size))
}

$('.but#mkdir i').click(function() {
  var name = prompt('Nom du nouveau dossier ?')
  if (name)
    socket.emit('mkdir', {
      'path': document.location.hash.substring(1),
      'name': name
    })
})

function cleanTitle(title){
  title = title.replace(/\.[A-Za-z0-9]*$/,'') //remove extension
  .replace(/S[0-9^E]*E[0-9]*/, '') //numero d'episode
  .replace(/[ \.](([Ff][Rr])|([Vv][Oo])|(VOSTFR)|(FASTSUB)|(HDTV)|(XviD-ARK01))/g, '') //remove useless stuff
  .replace(/\./g,' ') //point
  .replace(/ $/,''); //espace en fin de chaine

  return title
}

function getMediaType(title){
  var regex = /S[0-9^E]*E[0-9]/
  if(title.search(regex) == -1){
    return 'films'
  } else {
    return 'series'
  }
}
