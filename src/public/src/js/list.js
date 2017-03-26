;(function () {
  /**
   * List
   * @constructor
  */
  class _List {
    constructor () {
      this.vue = new App.Vue({
        el: '.list',
        data: {
          tabs: [
            {
              name: 'Torrents',
              id: 'torrents',
              state: false,
              columns: [
                'name',
                'size',
                'progress',
                'up',
                'down'
              ]
            },
            {
              name: 'Directories',
              id: 'directories',
              state: true,
              columns: [
                'name',
                'size',
                'date',
                'owner'
              ]
            }
          ],
          columns: [
            {
              name: 'Name',
              id: 'name',
              important: true,
              state: true,
              sort: 'asc'
            },
            {
              name: 'Size',
              id: 'size',
              important: true,
              state: true,
              sort: 'asc'
            },
            {
              name: 'Date',
              id: 'date',
              state: true,
              sort: 'asc'
            },
            {
              name: 'Owner',
              id: 'owner',
              state: true,
              sort: 'asc'
            },
            {
              name: 'Progress',
              id: 'progress',
              state: false,
              sort: 'asc'
            },
            {
              name: 'Down',
              id: 'down',
              state: false,
              sort: 'asc'
            },
            {
              name: 'Up',
              id: 'up',
              state: false,
              sort: 'asc'
            }
          ],
          lines: []
        }
      })

      $('.list').on('click', 'th', (e) => {
        var clickedColumn = $(e.currentTarget)
        var col = this.vue.$data.columns[$.indexOfO(this.vue.$data.columns, (e) => { return e.id === clickedColumn.attr('id') })]
        if (col.sort === 'asc') {
          col.sort = 'desc'
        } else {
          col.sort = 'asc'
        }
        this.sortLines(col.id, col.sort)
      })

    // scrollTop button
      $('.scrollTop').on('click', () => {
        $('body').animate({
          scrollTop: 0
        }, 1000)
      })
    }

  /**
   * Switch between all tables
   * @param {string} tabId - Id of the table
  */
    switchTab (tabId) {
      $('.list tr').removeClass('selected')
      var c, column
      for (var t in this.vue.$data.tabs) {
        var tab = this.vue.$data.tabs[t]

        if (tab.id === tabId) {
          tab.state = true
          for (c in this.vue.$data.columns) {
            column = this.vue.$data.columns[c]

            if (tab.columns.indexOf(column.id) !== -1) {
              column.state = true
            }
          }
        } else {
          tab.state = false
          for (c in this.vue.$data.columns) {
            column = this.vue.$data.columns[c]

            if (tab.columns.indexOf(column.id) !== -1 && !column.important) {
              column.state = false
            }
          }
        }
      }
    }

  /**
   * Add lines to table
   * @param {object} line - Line to add
  */
    addLine (line) {
      if ($.indexOfO(this.vue.$data.lines, (e) => { return e.name === line.name }) === -1) {
        this.vue.$data.lines.push(line)
      }
    }

  /**
   * Remove lines to table
   * @param {object} line - Line to remove
  */
    removeLine (line) {
      for (var l in this.vue.$data.lines) {
        if (this.vue.$data.lines[l].name === line.name) {
          this.vue.$data.lines.splice(l, 1)
          return
        }
      }
    }

  /**
   * Clear all lines into the table
  */
    clearLines () {
      this.vue.$data.lines = []
    }

  /**
   * Update all lines into the table
   * And remove absent lines
   * @param {array} lines - Array of lines to update
  */
    updateLines (lines) {
    // updates lines
      $.each(lines, (index, value) => {
        var li = $.indexOfO(this.vue.$data.lines, (e) => { return e.name === value.name })
        if (li !== -1) {
          var line = this.vue.$data.lines[li]
          $.each(value, (i, v) => {
            line[i] = v
          })
        } else {
          this.addLine(value)
        }
      })

    // remove old lines
      var vueLines = this.vue.$data.lines.slice(0)
      for (var key in vueLines) {
        var line = vueLines[key]
        var li = $.indexOfO(lines, (e) => { return e.name === line.name })
        if (li === -1) {
          this.removeLine(line)
        }
      }
    }

  /**
   * Update one line into the table
   * @param {object} line - The line to update
  */
    updateLine (line) {
      var li = $.indexOfO(this.vue.$data.lines, (e) => { return e.name === line.name })
      if (li !== -1) {
        if (typeof line.newname !== 'undefined') {
          line.name = line.newname
        }
        var l = this.vue.$data.lines[li]
        $.each(line, (i, v) => {
          l[i] = v
        })
        this.sortLines('name', 'asc')
      }
    }

  /**
   * Sort the lines in the list
   * @param {string} by - Column to sort by
   * @param {string} direction - Asc, Desc
  */
    sortLines (by, direction) {
      var dir = direction === 'asc' ? -1 : 1
      switch (by) {
        case 'date':
          this.vue.$data.lines.sort((a, b) => {
            var tamp
            var sa = a[by].split('/')
            tamp = sa[0]
            sa[0] = sa[1]
            sa[1] = tamp
            var sb = b[by].split('/')
            tamp = sb[0]
            sb[0] = sb[1]
            sb[1] = tamp
            return dir * (new Date(sa.join('/')) - new Date(sb.join('/')))
          })
          break
        default:
          this.vue.$data.lines.sort((a, b) => {
            if (a[by] < b[by]) {
              return dir
            } else if (a[by] > b[by]) {
              return -dir
            } else {
              return 0
            }
          })
          break
      }
    }

    updateDragDrop () {
      $('.list .file #name').draggable({
        revert: true
      })

      $('.list .file #name[extension="dir"]').droppable({
        greedy: true,
        drop: (e, element) => {
          App.Loading.show('action')
          var folder = $(e.target).attr('data-file')
          var file = element.draggable.attr('data-file')
          var path = `${App.hash}/`

          $.ajax({
            type: 'post',
            url: '/directory/mv',
            data: {
              'file': file,
              'path': path,
              'folder': folder
            },
            dataType: 'json',
            success: (file) => {
              if (file.err) {
                $.notify.error({
                  title: 'Error',
                  text: file.err,
                  duration: 10
                })
              } else {
                this.removeLine({
                  name: file.file
                })
              }
            }
          }).done(() => {
            App.Loading.hide('action')
          }).fail((err) => {
            App.Loading.hide('action')
            console.error(`Error in List.updateDragDrop() : ${err.statusText}`)
          })
        }
      })
    }
}
  App.List = new _List()
})()
