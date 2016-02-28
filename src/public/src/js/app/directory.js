require('src/js/app/format.js')
require('src/js/pnotif/pnotif.js')
require('src/js/storage.js')
require('src/js/app/mediainfo.js')
require('src/js/jquery/jquery-ui.min.js')
require('src/js/jquery/jquery-ui.touch-punch.min.js')

var Format = new _Format()
var Storage = new _Storage()

function Directory () {
  var self = this
  this.body = $('.list table tbody')
  this.size = $('.top-menu .folder-size')
  this.table = $('.list').click(function () {
    $('.list .file').removeClass('selected')
    self.setActions('',{
      download: false,
      rename: false,
      remove: false,
      info: false
    })
  })
  this.actions = {
    download: $('.top-menu .action #download'),
    rename: $('.top-menu .action #rename'),
    remove: $('.top-menu .action #remove'),
    info: $('.top-menu .action #info')
  }

  this.timer = null
  this.refresh = 30000

  $(window).bind('hashchange', function () {
    self.getList()
    self.setActions('',{
      download: false,
      rename: false,
      remove: false,
      info: false
    })
  }).trigger('hashchange')
}

Directory.prototype.appendSize = function (size) {
  this.size.text(Format.size(size))
}

Directory.prototype.getList = function () {
  var hash = document.location.hash.substring(1) ? document.location.hash.substring(1) : '/'
  var self = this
  $.post('/list-d', {dir: hash}, function (directory) {
    directory = JSON.parse(directory)
    if (directory.err) {
      var notif = new Pnotif()
      notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: " + directory.err + '</p>', 10000)
      notif.draw()
    } else {
      self.appendSize(directory.totalSize)
      self.body.html('')
      // TODO
      /*$.each($('.container .directory .list tbody *'), function (key, value) {
        $(value).addClass('toremove')
      })*/
      self.list(directory.files)
    // $('.toremove').remove()
    }
  })
  clearTimeout(this.timer)
  this.timer = setTimeout(function () { self.getList() }, this.refresh)
}

Directory.prototype.list = function (directory) {
  var kownFiles = Storage.readData('directory') ? Storage.readData('directory') : [] // array
  for (var key in directory) {
    var file = directory[key]
    file.name = key
    if (kownFiles.indexOf(file.name) == -1) {
      file.new = true
      kownFiles.push(file.name)
    } else {
      file.new = false
    }
    this.append(file)
  }
  Storage.storeData('directory', kownFiles)
}

Directory.prototype.append = function (file) {
  var self = this
  var $raw = $('<tr>').addClass(file.new ? 'file button new' : 'file button').attr('data-file', file.name).click(function (event) {
    event.stopPropagation()
    $('.list .file').removeClass('selected')
    $(this).addClass('selected')

    self.setActions(file, {
      download: file.isfile ? true : false,
      rename: true,
      remove: true,
      info: file.isfile ? true : false
    })
  })

  var $name = $('<td>').addClass('show').attr('id', 'name').attr('extention', Format.extention(file)).attr('data-file', file.name).html(
    file.isdir ?
      $('<a>').addClass('button').attr('href', '#' + document.location.hash.substring(1) + file.name + '/').text(file.name.substring(0, 50)) :
      file.name.substring(0, 30)).appendTo($raw)
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
            notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: " + file.err + '</p>', 10000)
            notif.draw()
          } else {
            $('tr[data-file="' + file.file + '"]').remove()
          }
        })
      }
    })

  var $size = $('<td>').addClass('show').attr('id', 'size').text(Format.size(file.size)).appendTo($raw)
  var $date = $('<td>').addClass('show').attr('id', 'date').text(Format.date(file.ctime)).appendTo($raw)

  this.body.append($raw)
}

Directory.prototype.setActions = function (file, actions) {
  for (var key in this.actions) {
    this.actions[key].removeClass('show').unbind();
  }
  if (actions.download) {
    this.actions.download.addClass('show').click(function () {
      window.open('files/?f=' + document.location.hash.substring(1) + file.name)
    })
  }
  if (actions.rename) {
    this.actions.rename.addClass('show').click(function () {
    var oldname = file.name.split('.')
    if (oldname.length > 1) {
      var extension = oldname.pop()
      extension = extension.length > 0 ? '.' + extension : ''
    } else {
      var extension = ''
    }
    var name = prompt('New name for: '+oldname.join(' '))
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
          console.log(data)
          file.name = data.newname
          $('tr[data-file="' + data.oldname + '"] td#name').attr('data-file', data.newname).html(
            file.isdir ?
              $('<a>').attr('href', '#' + document.location.hash.substring(1) + data.newname + '/').text(data.newname.substring(0, 50)) :
              data.newname.substring(0, 30)
          )
          $('tr[data-file="' + data.oldname + '"]').attr('data-file', data.newname)
        }
      })
    }
  })

  }
  if (actions.remove) {
    this.actions.remove.addClass('show').click(function () {
        if (confirm('Confirmer la suppression de ' + file.name + ' ?'))
          $.post('/remove-d', {file: document.location.hash.substring(1) + file.name}, function (file) {
            file = JSON.parse(file)
            if (file.err) {
              var notif = new Pnotif()
              notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: " + file.err + '</p>', 10000)
              notif.draw()
            } else {
              $('tr[data-file="' + file.file + '"]').remove()
            }
          })
      })
  }
  if (actions.info) {
    this.actions.info.addClass('show')
  }
}
