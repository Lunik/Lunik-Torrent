require('src/js/app/format.js')
var Format = new _Format()

function _Torrent(){
  this.body = $('.list table tbody')
  this.table = $('.list').click(function () {
    $('.list .file').removeClass('selected')
  })
  this.actions = $('.top-menu .action')

  this.timer = null
  this.refresh = 3000;

  //this.getList()
}

_Torrent.prototype.getList = function(){
  var hash = document.location.hash.substring(1) ? document.location.hash.substring(1) : '/'
  var self = this
  $.post('/list-t', function (torrents) {
    torrents = JSON.parse(torrents)
    if (torrents.err) {
      var notif = new Pnotif()
      notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: "+torrents.err+"</p>", 10000)
      notif.draw()
    } else {
      //TODO
      /*$('.toremove').remove()
      $.each($('.container .torrent .list tbody *'), function (key, value) {
        $(value).addClass('toremove')
      })*/
      self.body.html('')
      self.list(torrents)
    }

  })
  clearTimeout(this.timer)
  this.timer = setTimeout(function(){ self.getList() }, this.refresh)
}

_Torrent.prototype.list = function(torrents){
  for (key in torrents) {
    this.append(torrents[key])
  }
}

_Torrent.prototype.append = function(torrent) {
  if ($('.list  .torrent[hash=' + torrent.hash + ']').length > 0) {
    var $torrent = $('.torrent[hash=' + torrent.hash + ']')
    $torrent.html('')
    var needToAppend = 0
  } else {
    var $torrent = $('<tr>').addClass('torrent').attr('hash', torrent.hash)
    var needToAppend = 1
  }
  $torrent.click(function (event) {
    event.stopPropagation()
    $('.list .torrent').removeClass('selected')
    $(this).addClass('selected')
  })

  var $name = $('<td>').addClass('show').attr('id', 'name').text(Format.name(torrent.name.substring(0, 50))).appendTo($torrent)
  var $size = $('<td>').addClass('show').attr('id', 'size').text(Format.size(torrent.size)).appendTo($torrent)
  var $progress = $('<td>').addClass('show').attr('id', 'progress').append(
    $('<progress>').attr('max', 1).attr('value', torrent.progress),
    $('<p>').addClass('percent').text(Math.round(torrent.progress * 100) + '%'),
    $('<p>').addClass('remaining-time').text(Format.time(torrent.timeRemaining))
  ).appendTo($torrent)
  var $downspeed = $('<td>').addClass('show').attr('id', 'sdown').text(Format.speed(torrent.sdown)).appendTo($torrent)
  var $upspeed = $('<td>').addClass('show').attr('id','sup').text(Format.speed(torrent.sup)).appendTo($torrent)

  if (needToAppend) {
    this.body.append($torrent)
  }
}
