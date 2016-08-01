;(function () {
  /**
   * Torrent Manager
   * @constructor
  */
  function _Torrent () {
    var self = this
    $('.list').on('click', '.torrent', function () {
      $('.list .torrent').removeClass('selected')
      $(this).addClass('selected')
      self.setActions({
        name: $($(this).children('#name')).attr('data-file'),
        hash: $($(this).children('#name')).attr('hash')
      })
    })

    $('.left-menu .start').click(function () {
      var input = $('.left-menu .torrent-input input')
      if (input.val()) {
        self.download(input.val())
        input.val('')
        input.trigger('keyup')
      }
    })

    $('.left-menu .search').click(function () {
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
  _Torrent.prototype.setRefresh = function (state, time) {
    var self = this
    if (state) {
      clearInterval(self.interval)
      self.interval = setInterval(function () {
        self.getTorrents(function (tor) {
          self.append(tor)
        })
      }, time)
    } else {
      clearInterval(self.interval)
    }
  }

  /**
   * Get the current torrents infos from the server
   * @param {function} cb - Callback frunction with data
  */
  _Torrent.prototype.getTorrents = function (cb) {
    App.Loading.show('action')
    var self = this
    $.post('/list-t', function (torrents) {
      torrents = JSON.parse(torrents)
      if (torrents.err) {
        $.notify.error({
          title: 'Error',
          text: torrents.err
        })
      } else {
        App.Loading.hide('action')
        cb(torrents)
      }
    })
  }

  /**
   * Append torrents infos to List
   * @param {object} tor - torrent infos
  */
  _Torrent.prototype.append = function (tor) {
    var lines = []
    var i = 0
    $.each(tor, function (index, value) {
      lines.push({
        name: value.name,
        hash: value.hash,
        type: 'torrent',
        size: App.Format.size(value.size),
        progress: value.progress,
        percent: Math.round(value.progress * 100) + '%',
        timeRemaining: App.Format.time(value.timeRemaining),
        sdown: App.Format.speed(value.sdown),
        sup: App.Format.speed(value.sup)
      })

      i++
      if (i === Object.keys(tor).length) {
        App.List.updateLines(lines)
      }
    })
  }

  /**
   * Define and set actions for a specific torrent
   * @param {object} torrent - The torrent
  */
  _Torrent.prototype.setActions = function (torrent) {
    var self = this
    App.TopMenu.setActions({
      remove: true,
      info: 'unactive'
    })

    $('.top-menu .action').unbind()
      .on('click', '#remove', function () {
        self.remove(torrent)
      })
  }

  /**
   * Prompt and remove a torrent
   * @param {object} torrent - The torrent hash and name
  */
  _Torrent.prototype.remove = function (torrent) {
    if (confirm('Confirmer la suppression de ' + torrent.name + ' ?')) {
      $.post('/remove-t', {
        hash: torrent.hash
      }, function (file) {
        file = JSON.parse(file)
        if (torrent.err) {
          $.notify.error({
            title: 'Error',
            text: torrent.err
          })
        } else {
          App.List.removeLine({
            name: torrent.name
          })
        }
      })
    } else {
      App.Loading.hide('action')
    }
  }

  /**
   * Start a torrent
   * @param {string} url - The url of the torrent
  */
  _Torrent.prototype.download = function (url) {
    $.post('/download-t', {
      url: url
    }, function (data) {
      if (data.err) {
        $.notify.error({
          title: 'Error',
          text: data.err
        })
      } else {
        $.notify.success({
          text: 'The torrent will begin in a moment.'
        })
      }
    })
  }

  App.Torrent = new _Torrent()
})()
