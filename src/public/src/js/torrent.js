;(function () {
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
        $.post('/download-t', {
          url: input.val()
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
        input.val('')
        input.trigger('keyup')
      }
    })

    $('.left-menu .search').click(function () {

    })
  }

  _Torrent.prototype.setRefresh = function (state, time) {
    var self = this
    if (state) {
      self.interval = setInterval(function () {
        self.getTorrents()
      }, time)
    } else {
      clearInterval(self.interval)
    }
  }

  _Torrent.prototype.getTorrents = function (cb) {
    var self = this
    $.post('/list-t', function (torrents) {
      torrents = JSON.parse(torrents)
      if (torrents.err) {
        $.notify.error({
          title: 'Error',
          text: torrents.err
        })
      } else {
        console.log(torrents)
        self.append(torrents)
      }
    })
  }

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

  _Torrent.prototype.setActions = function (torrent) {
    var self = this
    App.TopMenu.setActions({
      remove: '',
      info: 'unactive'
    })

    $('.top-menu .action').unbind()
      .on('click', '#remove', function () {
        self.remove(torrent)
      })
  }

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
    }
  }
  App.Torrent = new _Torrent()
})()
