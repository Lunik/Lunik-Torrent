var Format = new _Format()
var Storage = new _Storage()

/**
 * Directory mamanger.
 * @constructor
*/
function _Directory () {
  var self = this
  this.body = $('.list table tbody')
  this.table = $('.list table')
  this.size = $('.top-menu .folder-size')
  this.table = $('.list')
  this.actions = {
    download: $('.top-menu .action #download'),
    rename: $('.top-menu .action #rename'),
    remove: $('.top-menu .action #remove'),
    info: $('.top-menu .action #info')
  }

  this.timer = null
  this.refresh = 30000

  // load new directory on hash change
  $(window).bind('hashchange', function () {
    self.body.html('')
    self.getList()
    self.setActions('', {
      download: null,
      rename: null,
      remove: null,
      info: null
    })
  }).trigger('hashchange')
}

/**
 * Append the size of the current directory.
 * @param {float} size - Size of the directory
*/
_Directory.prototype.appendSize = function (size) {
  this.size.text(Format.size(size))
}

/**
 * Get the list of the directory's files from the server.
*/
_Directory.prototype.getList = function () {
  var hash = document.location.hash.substring(1) || '/'
  var self = this
  $.post('/list-d', {
    dir: hash
  }, function (directory) {
    directory = JSON.parse(directory)
    if (directory.err) {
      $.notify.error({
        title: 'Error',
        text: directory.err
      })
    } else {
      self.appendSize(directory.totalSize)

      var currentScroll = $('body').scrollTop()

      var locked = {}
      for (var key in directory.infos) {
        if (directory.infos[key] && directory.infos[key].downloading) {
          locked[key] = directory.infos[key]
        }
        if (directory.infos[key] && directory.files[key]) {
          directory.files[key].owner = directory.infos[key].owner
        }
        if (directory.infos[key] && directory.files[key]) {
          directory.files[key].download = directory.infos[key].download
        }
      }
      self.list(directory.files, locked)

      $('body').scrollTop(currentScroll)
    }
  })
  clearTimeout(this.timer)
  this.timer = setTimeout(function () {
    self.getList()
  }, this.refresh)
}

/**
 * Setup files list.
 * @param {object} directory - Directory infos.
 * @param {object} locked - List of locked files.
*/
_Directory.prototype.list = function (directory, locked) {
  var kownFiles = Storage.readData('directory') || [] // array

  // ...
  var href = document.location.hash.substring(1).split('/')
  href.splice(href.length - 2 || 0, 1)
  href = href.join('/')
  this.append({ new: false, name: '..', href: href, isfile: false, isdir: true })

  $('.file.button[data-file!=".."]').addClass('toremove')

  for (var key in directory) {
    var file = directory[key]
    file.name = key
    file.href = document.location.hash.substring(1) + file.name + '/'
    if (kownFiles.indexOf(file.name) === -1) {
      file.new = true
      kownFiles.push(file.name)
    } else {
      file.new = false
    }

    file.locked = locked[file.href.slice(0, -1)]

    this.append(file)
  }

  $('.file.toremove').remove()
  Storage.storeData('directory', kownFiles)
}

/**
 * Append a file to the html table.
 * @param {object} file - File infos.
*/
_Directory.prototype.append = function (file) {
  var self = this
  var $raw
  if ($('.list  .file[data-file="' + file.name + '"]').length > 0) {
    $raw = $('.list  .file[data-file="' + file.name + '"]')
    $raw.removeClass('toremove')
    return 0
  } else {
    $raw = $('<tr>').addClass(file.new ? 'file button new' : 'file button').attr('data-file', file.name).click(function (event) {
      event.stopPropagation()
      $('.list .selected').children('#name').draggable('disable')
      $('.list .file').removeClass('selected')
      $(this).addClass('selected')

      self.setActions(file, {
        download: file.isfile,
        rename: !file.locked,
        remove: !file.locked,
        info: file.isfile
      })

      $(this).children('#name').draggable('enable')
    })

    var $name = $('<td>').attr('id', 'name').attr('extension', Format.extention(file)).attr('data-file', file.name).html(
      file.isdir
        ? $('<a>').addClass('button').attr('href', '#' + file.href).text(file.name)
        : file.name
    ).appendTo($raw).draggable({
      revert: true
    }).draggable('disable')
    if (file.isdir) {
      $name.droppable({
        greedy: true,
        drop: function (data, element) {
          var folder = $(this).attr('data-file')
          var file = element.draggable.attr('data-file')
          var path = document.location.hash.substring(1) || '/'

          $.post('/mv-d', {
            'file': file,
            'path': path,
            'folder': folder
          }, function (file) {
            file = JSON.parse(file)
            if (file.err) {
              $.notify.error({
                title: 'Error',
                text: file.err
              })
            } else {
              $('tr[data-file="' + file.file + '"]').remove()
            }
          })
        }
      })
    }
    if (file.locked) {
      $('<i>').addClass('fa fa-lock locked').appendTo($name)
    }
    if (file.download) {
      $('<i>').addClass('fa fa-download download').text(file.download).appendTo($name)
    }

    $('<td>').attr('id', 'size').text(Format.size(file.size)).appendTo($raw)
    $('<td>').attr('id', 'date').text(Format.date(file.ctime)).appendTo($raw)
    $('<td>').attr('id', 'owner').text(file.owner || '-').appendTo($raw)

    this.body.append($raw)
    $('.list table').trigger('update')
  }
}

/**
 * Setup actions button.
 * @param {object} file - File infos.
 * @param {object} actions -Alowed actions.
*/
_Directory.prototype.setActions = function (file, actions) {
  for (var key in this.actions) {
    this.actions[key].addClass('hide').unbind()
    this.actions[key].removeClass('unactive')
  }

  // DOWNLOAD
  if (actions.download) {
    this.actions.download.removeClass('hide')
    this.actions.download.parent().attr('href', 'files/?f=' + document.location.hash.substring(1) + file.name)
  } else if (actions.download === false) {
    this.actions.download.removeClass('hide')
    this.actions.download.addClass('unactive')
  }

  // RENAME
  if (actions.rename) {
    this.actions.rename.removeClass('hide').click(function () {
      var oldname = file.name.split('.')
      var extension
      if (oldname.length > 1 && file.isfile) {
        extension = oldname.pop()
        extension = extension.length > 0 ? '.' + extension : ''
      } else {
        extension = ''
      }
      var name = prompt('New name for: ' + oldname.join(' '), oldname.join(' '))
      if (name) {
        name = name.split('/').pop() + extension
        name = name.trim()
        $.post('/rename-d', {
          'path': document.location.hash.substring(1) || '/',
          'oldname': file.name,
          'newname': name
        }, function (data) {
          data = JSON.parse(data)
          if (data.err) {
            $.notify.error({
              title: 'Error',
              text: data.err
            })
          } else {
            file.name = data.newname
            $('tr[data-file="' + data.oldname + '"] td#name').attr('data-file', data.newname).html(
              file.isdir
                ? $('<a>').attr('href', '#' + document.location.hash.substring(1) + data.newname + '/').text(data.newname)
                : data.newname
            )
            $('tr[data-file="' + data.oldname + '"]').attr('data-file', data.newname)
          }
        })
      }
    })
  } else if (actions.rename === false) {
    this.actions.rename.removeClass('hide')
    this.actions.rename.addClass('unactive')
  }

  // REMOVE
  if (actions.remove) {
    this.actions.remove.removeClass('hide').click(function () {
      if (confirm('Confirmer la suppression de ' + file.name + ' ?')) {
        $.post('/remove-d', {
          file: document.location.hash.substring(1) + file.name
        }, function (file) {
          file = JSON.parse(file)
          if (file.err) {
            $.notify.error({
              title: 'Error',
              text: file.err
            })
          } else {
            $('tr[data-file="' + file.file + '"]').remove()
          }
        })
      }
    })
  } else if (actions.remove === false) {
    this.actions.remove.removeClass('hide')
    this.actions.remove.addClass('unactive')
  }

  // INFOS
  if (actions.info) {
    this.actions.info.removeClass('hide').click(function () {
      var info = new _MediaInfo()
      info.get(file.name)
    })
  } else if (actions.info === false) {
    this.actions.info.removeClass('hide')
    this.actions.info.addClass('unactive')
  }
}
