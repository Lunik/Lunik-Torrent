var Format = new _Format()

/**
 * Torrent manager.
 * @constructor
*/
function _Torrent () {
  this.body = $('.list table tbody')
  this.table = $('.list').click(function () {
    $('.list .file').removeClass('selected')
  })
  this.actions = {
    remove: $('.top-menu .action #remove'),
    info: $('.top-menu .action #info')
  }

  this.timer = null
  this.refresh = 3000
}

/**
 * Get the torrent list from the server.
*/
_Torrent.prototype.getList = function () {
  var self = this
  $.post('/list-t', function (torrents) {
    torrents = JSON.parse(torrents)
    if (torrents.err) {
      $.notify.error({
        title: 'Error',
        text: torrents.err
      })
    } else {
      var currentScroll = $('body').scrollTop()

      self.list(torrents)

      $('body').scrollTop(currentScroll)
    }
  })
  clearTimeout(this.timer)
  this.timer = setTimeout(function () {
    self.getList()
  }, this.refresh)
}

/**
 * Setup torrent list.
 * @param {object} torrents - Torrents infos.
*/
_Torrent.prototype.list = function (torrents) {
  $('.torrent.button').addClass('toremove')
  for (var key in torrents) {
    this.append(torrents[key])
  }
  $('.torrent.toremove').remove()
}

/**
 * Append a torrent to the screen.
 * @param {object} torrent - Torrent infos.
*/
_Torrent.prototype.append = function (torrent) {
  var self = this
  var needToAppend
  var $torrent
  if ($('.list  .torrent[hash=' + torrent.hash + ']').length > 0) {
    $torrent = $('.list .torrent[hash=' + torrent.hash + ']')
    $torrent.html('')
    $torrent.removeClass('toremove')
    needToAppend = 0
  } else {
    $torrent = $('<tr>').addClass('torrent button').attr('hash', torrent.hash)
    needToAppend = 1
  }
  $torrent.click(function (event) {
    event.stopPropagation()
    $('.list .torrent').removeClass('selected')
    $(this).addClass('selected')

    self.setActions(torrent, {
      remove: true,
      info: true
    })
  })

  $('<td>').attr('id', 'name').text(Format.name(torrent.name.substring(0, 50))).appendTo($torrent)
  $('<td>').attr('id', 'size').text(Format.size(torrent.size)).appendTo($torrent)
  $('<td>').attr('id', 'progress').append(
    $('<progress>').attr('max', 1).attr('value', torrent.progress),
    $('<p>').addClass('percent').text(Math.round(torrent.progress * 100) + '%'),
    $('<p>').addClass('remaining-time').text(Format.time(torrent.timeRemaining))
  ).appendTo($torrent)
  $('<td>').attr('id', 'sdown').text(Format.speed(torrent.sdown)).appendTo($torrent)
  $('<td>').attr('id', 'sup').text(Format.speed(torrent.sup)).appendTo($torrent)

  if (needToAppend) {
    this.body.append($torrent)
  }
}

/**
 * Setup actions aviable for the torrent.
 * @param {object} torrent - Torrent infos.
 * @param {object} actions - List of allowed actions.
*/
_Torrent.prototype.setActions = function (torrent, actions) {
  for (var key in this.actions) {
    this.actions[key].addClass('hide').unbind()
  }

  if (actions.remove) {
    this.actions.remove.removeClass('hide').click(function () {
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
            $('tr[hash="' + torrent.hash + '"]').remove()
          }
        })
      }
    })
  }
  if (actions.info) {
    this.actions.info.removeClass('hide')
  }
}
