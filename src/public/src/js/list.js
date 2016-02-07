$(window).bind('hashchange', initList).trigger('hashchange')

var DTimer
var TTimer

function initList () {
  filAriane()
  listD()
  listT()
}

function listD () {
  var hash = document.location.hash.substring(1) ? document.location.hash.substring(1) : '/'
  $.post('/list-d', {dir: hash}, function (directory) {
    directory = JSON.parse(directory)
    if (directory.err) {
      var notif = new Pnotif()
      notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+directory.err+"</p>", 10000)
      notif.draw()
    } else {
      appendDirectorySize(directory.totalSize)
      $.each($('.container .directory .list tbody *'), function (key, value) {
        $(value).addClass('toremove')
      })
      listDirectory(directory.files)
      $('.toremove').remove()
    }
  })
  clearTimeout(DTimer)
  DTimer = setTimeout(listD, 30000)
}

function listT () {
  var hash = document.location.hash.substring(1) ? document.location.hash.substring(1) : '/'
  $.post('/list-t', function (torrents) {
    torrents = JSON.parse(torrents)
    if (torrents.err) {
      var notif = new Pnotif()
      notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+torrents.err+"</p>", 10000)
      notif.draw()
    } else {
      $('.toremove').remove()
      $.each($('.container .torrent .list tbody *'), function (key, value) {
        $(value).addClass('toremove')
      })
      listTorrent(torrents)
    }

  })
  clearTimeout(TTimer)
  TTimer = setTimeout(listT, 3000)
}

function listTorrent (torrents) {
  for (key in torrents) {
    appendTorrent(torrents[key])
  }
}

function listDirectory (directory) {
  var i = 0
  var kownFiles = readData('directory') ? readData('directory') : [] // array
  for (var key in directory) {
    var file = directory[key]
    file.alter = i
    file.name = key
    if (kownFiles.indexOf(file.name) == -1) {
      file.new = true
      kownFiles.push(file.name)
    } else {
      file.new = false
    }
    appendDirectory(file)
    i = (i + 1) % 2
  }
  storeData('directory', kownFiles)
}

function filAriane () {
  var $ariane = $('.directory .fil-ariane').html('')
  var $delimiter = $('<span>').addClass('delimiter').text('>')

  var $home = $('<a>').attr('href', '#').attr('data-file', '/').text('Home').appendTo($ariane)

  var directories = document.location.hash.substring(1).split('/')
  var profDir = ''
  directories.forEach(function (dir) {
    if (dir != '') {
      $ariane.append($delimiter.clone())
      profDir += dir + '/'
      $('<a>').attr('href', '#' + profDir).text(dir).appendTo($ariane)
    }
  })

  $('.fil-ariane a').droppable({
    greedy: true,
    drop: function (data) {
      var folder = ''
      var file = $(data.toElement).attr('data-file')
      var path = $(this).attr('href')

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
}
