;(function () {
  /**
   * Directory manager
   * @constructor
  */
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

      App.List.updateDragDrop()
      $('.list .file .ui-draggable').draggable('disable')
      $(this).children('#name').draggable('enable')
    })

    $('.left-menu .new').click(function () {
      self.newFolder()
    })
  }

  /**
   * Set the refresh interval of the directory
   * @param {bool} state - State of the refresh interval
   * @param {int} time - Time in millis of the interval refresh
  */
  _Directory.prototype.setRefresh = function (state, time) {
    var self = this
    if (state) {
      clearInterval(self.interval)
      self.interval = setInterval(function () {
        self.getDir(function(dir){
          self.append(dir)
        })
      }, time)
    } else {
      clearInterval(self.interval)
    }
  }

  /**
   * Get the directory infos from the server
   * @param {function} cb - Callback frunction with data
  */
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
        cb(directory)
      }
    })
  }

  /**
   * Append directories infos to List
   * @param {object} dir - directory infos
  */
  _Directory.prototype.append = function (dir) {
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

  /**
   * Define and set actions for a specific file
   * @param {object} file - The file
  */
  _Directory.prototype.setActions = function (file) {
    var self = this
    App.TopMenu.setActions({
      download: file.isdir ? 'unactive' : true,
      rename: file.lock ? 'unactive' : true,
      remove: file.lock ? 'unactive' : true,
      info: file.isdir ? 'unactive' : true
    })

    $('.top-menu .action').unbind()
      .on('click', '#download', function(){
        window.open('files/?f=' + document.location.hash.substring(1) + file.name)
      })
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

  /**
   * Prompt and rename a file
   * @param {string} fileName - The name of the file
  */
  _Directory.prototype.rename = function (fileName) {
    var oldname = fileName.split('.')
    var extension
    if (oldname.length > 1) {
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
            newname: data.newname,
            href: '#' + App.hash + data.newname + '/',
          })
        }
      })
    }
  }

  /**
   * Prompt and remove a file
   * @param {string} fileName - The name of the file
  */
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

  /**
   * Get infos from a file
   * @param {string} fileName - The name of the file
  */
  _Directory.prototype.info = function (fileName) {
    App.MediaInfo.get(fileName)
  }

  _Directory.prototype.newFolder = function () {
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
