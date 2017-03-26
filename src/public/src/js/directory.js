;(function () {
  /**
   * Directory manager
   * @constructor
  */
  class _Directory {
    constructor () {
      $('body').on('click', '.list .file', (e) => {
        $('.list .file').removeClass('selected')
        $(e.currentTarget).addClass('selected')
        this.setActions({
          name: $($(e.currentTarget).children('#name')).attr('data-file'),
          isdir: $($(e.currentTarget).children('#name')).attr('extension') === 'dir',
          isfile: $($(e.currentTarget).children('#name')).attr('extension') !== 'dir',
          lock: typeof $($(e.currentTarget).children('#name')).attr('lock') !== 'undefined'
        })

        App.List.updateDragDrop()
        $('.list .file .ui-draggable').draggable('disable')
        $(e.currentTarget).children('#name').draggable('enable')
      })

      $('body').on('click', '.left-menu .new', () => {
        this.newFolder()
      })
    }

  /**
   * Set the refresh interval of the directory
   * @param {bool} state - State of the refresh interval
   * @param {int} time - Time in millis of the interval refresh
  */
    setRefresh (state, time) {
      if (state) {
        clearInterval(this.interval)
        this.interval = setInterval(() => {
          this.getDir((dir) => {
            this.append(dir)
          })
        }, time)
      } else {
        clearInterval(this.interval)
      }
    }

  /**
   * Get the directory infos from the server
   * @param {function} cb - Callback frunction with data
  */
    getDir (cb) {
      App.Loading.show('action')
      $.ajax({
        type: 'get',
        url: '/directory/list',
        data: {
          dir: App.hash || '/'
        },
        dataType: 'json',
        success: (directory) => {
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
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error in Directory.getDir() : ${err.statusText}`)
      })
    }

  /**
   * Append directories infos to List
   * @param {object} dir - directory infos
  */
    append (dir) {
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
        $.each(dir.files, (index, value) => {
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
    setActions (file) {
      App.TopMenu.setActions({
        download: file.isdir ? 'unactive' : true,
        rename: file.lock ? 'unactive' : true,
        remove: file.lock ? 'unactive' : true,
        info: file.isdir ? 'unactive' : true
      })

      $('.top-menu .action').unbind()
      .on('click', '#download', () => {
        window.open(`files/?f=${document.location.hash.substring(1)}${file.name}`)
      })
      .on('click', '#rename', () => {
        this.rename(file.name, file.isdir)
      })
      .on('click', '#remove', () => {
        this.remove(file.name)
      })
      .on('click', '#info', () => {
        this.info(file.name)
      })
    }

    deselectAll () {
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
    rename (fileName, dir) {
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
          success: (data) => {
            this.deselectAll()
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
        }).done(() => {
          App.Loading.hide('action')
        }).fail((err) => {
          App.Loading.hide('action')
          console.error(`Error in Directory.rename() : ${err.statusText}`)
        })
      } else {
        App.Loading.hide('action')
      }
    }

  /**
   * Prompt and remove a file
   * @param {string} fileName - The name of the file
  */
    remove (fileName) {
      App.Loading.show('action')
      if (confirm(`Confirmer la suppression de ${fileName} ?`)) {
        $.ajax({
          type: 'post',
          url: '/directory/remove',
          data: {
            file: `${App.hash}${fileName}`
          },
          dataType: 'json',
          success: (file) => {
            this.deselectAll()
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
        }).done(() => {
          App.Loading.hide('action')
        }).fail((err) => {
          App.Loading.hide('action')
          console.error(`Error in Directory.remove() : ${err.statusText}`)
        })
      } else {
        App.Loading.hide('action')
      }
    }

  /**
   * Get infos from a file
   * @param {string} fileName - The name of the file
  */
    info (fileName) {
      App.MediaInfo.get(fileName)
    }

    newFolder () {
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
          success: (file) => {
            this.deselectAll()
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
        }).done(() => {
          App.Loading.hide('action')
        }).fail((err) => {
          App.Loading.hide('action')
          console.error(`Error in Directory.newFolder() : ${err.statusText}`)
        })
      } else {
        App.Loading.hide('action')
      }
    }
}
  App.Directory = new _Directory()
})()
