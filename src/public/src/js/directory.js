function appendDirectory (file) {
  var $file = $('<tr>').addClass(file.new ? 'file new' : 'file').attr('data-file', file.name)
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
      drop: function (data) {
        var folder = $(this).attr('data-file')
        var file = $(data.toElement).attr('data-file')
        var path = document.location.hash.substring(1) ? document.location.hash.substring(1) : '/'

        $.post('/mv-d', {
          'file': file,
          'path': path,
          'folder': folder
        }, function (file) {
          file = JSON.parse(file)
          if (file.err) {
            var notif = new Pnotif()
            notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+file.err+"</p>", 10000)
            notif.draw()
          } else {
            $('tr[data-file="' + file.file + '"]').remove()
          }
        })
      }
    })

  var $size = $('<td>').addClass('size').text(formatSize(file.size)).appendTo($file)
  var $date = $('<td>').addClass('date').text(formatDate(file.ctime)).appendTo($file)
  var $actions = $('<td>').addClass('actions')

  if (file.isfile) {
    var $downloadBut = $('<i>').addClass('but fa fa-download').attr('id', 'download').text('download').appendTo($actions).click(function () {
      window.open('files/?f=' + document.location.hash.substring(1) + file.name)
    })
  }
  var $deleteBut = $('<i>').addClass('but fa fa-remove').attr('id', 'delete').text('delete').appendTo($actions).click(function () {
    if (confirm('Confirmer la suppression de ' + file.name + ' ?'))
      $.post('/remove-d', {file: document.location.hash.substring(1) + file.name}, function (file) {
        file = JSON.parse(file)
        if (file.err) {
          var notif = new Pnotif()
          notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+file.err+"</p>", 10000)
          notif.draw()
        } else {
          $('tr[data-file="' + file.file + '"]').remove()
        }
      })
  })

  var $renameBut = $('<i>').addClass('but fa fa-pencil').attr('id', 'rename').text('rename').appendTo($actions).click(function () {
    var oldname = file.name.split('.')
    if (oldname.length > 1) {
      var extension = oldname.pop()
      extension = extension.length > 0 ? '.' + extension : ''
    } else {
      var extension = ''
    }
    var name = prompt('New Name', oldname.join(' '))
    if (name) {
      name = name.split('\/').pop() + extension
      $.post('/rename-d', {
        'path': document.location.hash.substring(1) ? document.location.hash.substring(1) : '/',
        'oldname': file.name,
        'newname': name
      }, function (data) {
        data = JSON.parse(data)
        if (data.err) {
          var notif = new Pnotif()
          notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+data.err+"</p>", 10000)
          notif.draw()
        } else {
          file.name = data.newname
          $('tr[data-file="' + data.oldname + '"] td.name').attr('data-file', data.newname).html(
            file.isdir ?
              $('<a>').attr('href', '#' + document.location.hash.substring(1) + data.newname + '/').text(data.newname.substring(0, 50)) :
              data.newname.substring(0, 30)
          )
          $('tr[data-file="' + data.oldname + '"]').attr('data-file', data.newname)
        }
      })
    }
  })

  if (file.isfile) {
    var $infoBut = $('<i>').addClass('but fa fa-info').attr('id', 'info').text('infos').appendTo($actions).click(function () {
      mediaInfoGet(file.name)
    })
  }

  $actions.appendTo($file)

  $file.appendTo('.container .directory .list')
}

function appendDirectorySize (size) {
  $('.folder-size').text(formatSize(size))
}

$('.but#mkdir i').click(function () {
  var name = prompt('Nom du nouveau dossier ?')
  if (name)
    $.post('/mkdir-d', {
      'path': document.location.hash.substring(1) ? document.location.hash.substring(1) : '/',
      'name': name
    }, function (name) {
      name = JSON.parse(name)
      if(name.err){
        var notif = new Pnotif()
        notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+file.err+"</p>", 10000)
        notif.draw()
      } else {
        appendDirectory({alter: 0, name: name.name, isdir: true, isfile: false, size: 0, ctime: new Date(), new: true})
      }
    })
})
