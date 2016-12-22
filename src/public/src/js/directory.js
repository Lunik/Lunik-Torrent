;(function () {
  /**
   * Directory manager
   * @constructor
  */
  function _Directory () {
    var self = this
    $('body').on('click', '.list .file', function () {
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

    $('body').on('click', '.left-menu .new', function () {
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
        self.getDir(function (dir) {
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
    App.Loading.show('action')
    $.ajax({
      type: 'get',
      url: '/directory/list',
      data: {
        dir: App.hash || '/'
      },
      dataType: 'json',
      success: function (directory) {
        if (directory.err) {
          $.notify.error({
            title: 'Error',
            text: directory.err,
            duration: 10
          })
        } else {
          cb(directory)
        }
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      App.Loading.hide('action')
      console.error(`Error in Directory.getDir() : ${err.statusText}`);
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

    var lines = [{
      name: '..',
      href: `#${previousDir}`,
      type: 'file',
      size: '-',
      date: App.Format.date(new Date()),
      owner: '-',
      extension: 'dir',
      progress: 0
    }]
    var i = 0
    if (Object.keys(dir.files).length > 0) {
      $.each(dir.files, function (index, value) {
        value.name = index
        lines.push({
          name: index,
          href: value.isfile ? null : `#${App.hash}${index}/`,
          url: encodeURI(`${window.location.host}/files/?f=${document.location.hash.substring(1)}${index}`),
          type: 'file',
          extension: App.Format.extention(value),
          size: value.isfile ? App.Format.size(value.size) : '-',
          date: App.Format.date(value.ctime),
          owner: value.owner || '-',
          lock: value.downloading > 0,
          download: value.download > 0 ? value.download : null,
          progress: 0
        })

        i++
        if (i === Object.keys(dir.files).length) {
          App.List.updateLines(lines)
        }
      })
    } else {
      App.List.updateLines(lines)
    }
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
      .on('click', '#download', function () {
        window.open(`files/?f=${document.location.hash.substring(1)}${file.name}`)
      })
      .on('click', '#rename', function () {
        self.rename(file.name, file.isdir)
      })
      .on('click', '#remove', function () {
        self.remove(file.name)
      })
      .on('click', '#info', function () {
        self.info(file.name)
      })
  }

  _Directory.prototype.deselectAll = function () {
    $('.list .file').removeClass('selected')
    App.TopMenu.setActions({
      download: false,
      rename: false,
      remove: false,
      info: false
    })
  }
  /**
   * Prompt and rename a file
   * @param {string} fileName - The name of the file
  */
  _Directory.prototype.rename = function (fileName, dir) {
    var self = this
    App.Loading.show('action')
    var oldname = fileName.split('.')
    var extension
    if (oldname.length > 1 && !dir) {
      extension = oldname.pop()
      extension = extension.length > 0 ? `.${extension}` : ''
    } else {
      extension = ''
    }
    var name = prompt(`New name for: ${oldname.join(' ')}`, oldname.join(' '))
    if (name) {
      name = name.trim()
      name = `${name.split('/').pop()}${extension}`
      $.ajax({
        type: 'post',
        url: '/directory/rename',
        data: {
          'path': App.hash || '/',
          'oldname': fileName,
          'newname': name
        },
        dataType: 'json',
        success: function (data) {
          self.deselectAll()
          if (data.err) {
            $.notify.error({
              title: 'Error',
              text: data.err,
              duration: 10
            })
          } else {
            App.List.updateLine({
              name: fileName,
              newname: data.newname,
              href: dir ? `#${App.hash}${data.newname}/` : null,
              url: encodeURI(`${window.location.host}/files/?f=${document.location.hash.substring(1)}${data.newname}`)
            })
          }
        }
      }).done(function () {
        App.Loading.hide('action')
      }).fail(function (err) {
        App.Loading.hide('action')
        console.error(`Error in Directory.rename() : ${err.statusText}`);
      })
    } else {
      App.Loading.hide('action')
    }
  }

  /**
   * Prompt and remove a file
   * @param {string} fileName - The name of the file
  */
  _Directory.prototype.remove = function (fileName) {
    var self = this
    App.Loading.show('action')
    if (confirm(`Confirmer la suppression de ${fileName} ?`)) {
      $.ajax({
        type: 'post',
        url: '/directory/remove',
        data: {
          file: `${App.hash}${fileName}`
        },
        dataType: 'json',
        success: function (file) {
          self.deselectAll()
          if (file.err) {
            $.notify.error({
              title: 'Error',
              text: file.err,
              duration: 10
            })
          } else {
            App.List.removeLine({
              name: file.file
            })
          }
        }
      }).done(function () {
        App.Loading.hide('action')
      }).fail(function (err) {
        App.Loading.hide('action')
        console.error(`Error in Directory.remove() : ${err.statusText}`);
      })
    } else {
      App.Loading.hide('action')
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
    var self = this
    App.Loading.show('action')
    var name = prompt('Nom du nouveau dossier ?')
    if (name) {
      $.ajax({
        type: 'post',
        url: '/directory/mkdir',
        data: {
          'path': App.hash || '/',
          'name': name
        },
        dataType: 'json',
        success: function (file) {
          self.deselectAll()
          if (file.err) {
            $.notify.error({
              title: 'Error',
              text: file.err,
              duration: 10
            })
          } else {
            App.List.addLine({
              name: file.name,
              href: `#${App.hash}${file.name}/`,
              type: 'file',
              extension: 'dir',
              size: App.Format.size(0),
              date: App.Format.date(new Date()),
              owner: '-',
              lock: false,
              download: '',
              progress: 0
            })

            App.List.sortLines('name', 'asc')
          }
        }
      }).done(function () {
        App.Loading.hide('action')
      }).fail(function (err) {
        App.Loading.hide('action')
        console.error(`Error in Directory.newFolder() : ${err.statusText}`);
      })
    } else {
      App.Loading.hide('action')
    }
  }
  App.Directory = new _Directory()
})()
