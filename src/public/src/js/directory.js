;(function () {
  function _Directory () {
    var self = this
    $('.list').on('click', '.file', function () {
      $('.list .file').removeClass('selected')
      $(this).addClass('selected')
      self.setActions({
        name: $($(this).children('#name')).attr('data-file'),
        isdir: $($(this).children('#name')).attr('extension') === 'dir',
        isfile: $($(this).children('#name')).attr('extension') !== 'dir',
        lock: typeof $($(this).children('#name')).attr('lock') !== 'undefined'
      })
    })

    $('.left-menu .new').click(function(){
      self.newFolder()
    })
  }

  _Directory.prototype.setRefresh = function (state, time) {
    var self = this
    if (state) {
      self.interval = setInterval(function () {
        self.getDir()
      }, time)
    } else {
      clearInterval(self.interval)
    }
  }

  _Directory.prototype.getDir = function (cb) {
    var self = this
    $.post('/list-d', {
      dir: App.hash || '/'
    }, function (directory) {
      directory = JSON.parse(directory)
      if (directory.err) {
        $.notify.error({
          title: 'Error',
          text: directory.err
        })
      } else {
        self.append(directory)
      }
    })
  }

  _Directory.prototype.append = function (dir) {
    console.log(dir)
    App.TopMenu.setFolderSize(App.Format.size(dir.totalSize))
    var previousDir = App.hash.split('/')
    if (previousDir[previousDir.length - 1] === '') {
      previousDir.pop()
    }
    previousDir.pop()
    previousDir = previousDir.join('/')
    App.List.addLine({
      name: '..',
      href: '#' + previousDir,
      type: 'file',
      extension: 'dir'
    })

    var lines = []
    var i = 0
    $.each(dir.files, function (index, value) {
      value.name = index
      lines.push({
        name: index,
        href: value.isfile ? null : '#' + App.hash + index + '/',
        type: 'file',
        extension: App.Format.extention(value),
        size: App.Format.size(value.size),
        date: App.Format.date(value.ctime),
        owner: value.owner || '-',
        lock: typeof value.downloading !== 'undefined',
        download: value.download
      })

      i++
      if (i === Object.keys(dir.files).length) {
        App.List.updateLines(lines)
      }
    })
  }

  _Directory.prototype.setActions = function (file) {
    var self = this
    App.TopMenu.setActions({
      download: file.isdir ? 'unactive' : '',
      rename: file.lock ? 'unactive' : '',
      remove: file.lock ? 'unactive' : '',
      info: file.isdir ? 'unactive' : ''
    })

    App.TopMenu.setDowloadLink('files/?f=' + document.location.hash.substring(1) + file.name)

    $('.top-menu .action').unbind()
      .on('click', '#rename', function () {
        self.rename(file.name)
      })
      .on('click', '#remove', function () {
        self.remove(file.name)
      })
      .on('click', '#info', function () {
        self.info(file.name)
      })
  }

  _Directory.prototype.rename = function (fileName) {
    var oldname = fileName.split('.')
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
        'path': App.hash || '/',
        'oldname': fileName,
        'newname': name
      }, function (data) {
        data = JSON.parse(data)
        if (data.err) {
          $.notify.error({
            title: 'Error',
            text: data.err
          })
        } else {
          App.List.updateLine({
            name: fileName,
            newname: data.newname
          })
        }
      })
    }
  }

  _Directory.prototype.remove = function (fileName) {
    if (confirm('Confirmer la suppression de ' + fileName + ' ?')) {
      $.post('/remove-d', {
        file: App.hash + fileName
      }, function (file) {
        file = JSON.parse(file)
        if (file.err) {
          $.notify.error({
            title: 'Error',
            text: file.err
          })
        } else {
          App.List.removeLine({
            name: file.file
          })
        }
      })
    }
  }

  _Directory.prototype.info = function (fileName) {
    App.MediaInfo.get(fileName)
  }

  _Directory.prototype.newFolder = function(){
    var name = prompt('Nom du nouveau dossier ?')
    if (name) {
      $.post('/mkdir-d', {
        'path': App.hash || '/',
        'name': name
      }, function (file) {
        file = JSON.parse(file)
        if (file.err) {
          $.notify.error({
            title: 'Error',
            text: file.err
          })
        } else {
          App.List.addLine({
            name: file.name,
            href: App.hash + file.name + '/',
            type: 'file',
            extension: 'dir',
            size: App.Format.size(0),
            date: App.Format.date(new Date()),
            owner: '-',
            lock: false,
            download: ''
          })

          App.List.sortLines('name', 'asc')
        }
      })
    }
  }
  App.Directory = new _Directory()
})()
