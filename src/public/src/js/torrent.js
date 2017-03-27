;(function () {
  /**
   * Torrent Manager
   * @constructor
  */
  class _Torrent {
    constructor () {
      $('body').on('click', '.list .torrent', (e) => {
        $('.list .torrent').removeClass('selected')
        $(e.currentTarget).addClass('selected')
        this.setActions({
          name: $($(e.currentTarget).children('#name')).attr('data-file'),
          hash: $($(e.currentTarget).children('#name')).attr('hash')
        })
      })

      $('body').on('click', '.left-menu .start', () => {
        var input = $('.left-menu .torrent-input input')
        if (input.val()) {
          this.download(input.val())
          input.val('')
          input.trigger('keyup')
        }
      })

      $('body').on('click', '.left-menu .search', () => {
        var input = $('.left-menu .torrent-input input')
        App.SearchTorrent.search(input.val())
        App.LeftMenu.addInputList('torrent-input', input.val())
        input.val('')
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
          this.getTorrents((tor) => {
            this.append(tor)
          })
        }, time)
      } else {
        clearInterval(this.interval)
      }
    }

  /**
   * Get the current torrents infos from the server
   * @param {function} cb - Callback frunction with data
  */
    getTorrents (cb) {
      App.Loading.show('action')
      $.ajax({
        type: 'get',
        url: '/torrent/list',
        data: {},
        dataType: 'json',
        success: (torrents) => {
          if (torrents.err) {
            $.notify.error({
              title: 'Error',
              text: torrents.err,
              duration: 10
            })
          } else {
            cb(torrents)
          }
        }
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error in Torrent.getTorrents() : ${err.statusText}`)
      })
    }

  /**
   * Append torrents infos to List
   * @param {object} tor - torrent infos
  */
    append (tor) {
      var lines = []
      var i = 0
      if (Object.keys(tor).length > 0) {
        $.each(tor, (index, value) => {
          lines.push({
            name: value.name,
            hash: value.hash,
            type: 'torrent',
            size: App.Format.size(value.size),
            progress: value.progress,
            percent: `${Math.round(value.progress * 100)} %`,
            timeRemaining: App.Format.time(value.timeRemaining),
            sdown: App.Format.speed(value.sdown),
            sup: App.Format.speed(value.sup)
          })

          i++
          if (i === Object.keys(tor).length) {
            App.List.updateLines(lines)
          }
        })
      } else {
        App.List.updateLines({})
      }
    }

  /**
   * Define and set actions for a specific torrent
   * @param {object} torrent - The torrent
  */
    setActions (torrent) {
      App.TopMenu.setActions({
        remove: true,
        info: 'unactive'
      })

      $('.top-menu .action').unbind()
      .on('click', '#remove', () => {
        this.remove(torrent)
      })
    }

    deselectAll () {
      $('.list .torrent').removeClass('selected')
      App.TopMenu.setActions({
        remove: false,
        info: false
      })
    }

  /**
   * Prompt and remove a torrent
   * @param {object} torrent - The torrent hash and name
  */
    remove (torrent) {
      App.Loading.show('action')
      if (confirm(`Confirmer la suppression de ${torrent.name} ?`)) {
        $.ajax({
          type: 'post',
          url: '/torrent/remove',
          data: {
            hash: torrent.hash
          },
          dataType: 'json',
          success: (file) => {
            this.deselectAll()
            if (torrent.err) {
              $.notify.error({
                title: 'Error',
                text: torrent.err,
                duration: 10
              })
            } else {
              App.List.removeLine({
                name: torrent.name
              })
            }
          }
        }).done(() => {
          App.Loading.hide('action')
        }).fail((err) => {
          App.Loading.hide('action')
          console.error(`Error in Torrent.remove() : ${err.statusText}`)
        })
      } else {
        App.Loading.hide('action')
      }
    }

  /**
   * Start a torrent
   * @param {string} url - The url of the torrent
  */
    download (url) {
      App.Loading.show('action')
      $.ajax({
        type: 'post',
        url: '/torrent/download',
        data: {
          url: url
        },
        dataType: 'json',
        success: (data) => {
          if (data.err) {
            $.notify.error({
              title: 'Error',
              text: data.err,
              duration: 10
            })
          } else {
            $.notify.success({
              text: 'The torrent will begin in a moment.'
            })
          }
        }
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error Torrent.download() : ${err.statusText}`)
      })
    }
}
  App.Torrent = new _Torrent()
})()
