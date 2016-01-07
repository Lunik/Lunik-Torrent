var socket = io()

socket.on('update-t', function () {
  listT()
})

socket.on('finish-t', function (hash) {
  $('.torrent[hash=' + hash + ']').remove()
})

socket.on('list-t', function (torrents) {
  listTorrent(torrents)
})

socket.on('list-d', function (directory) {
  $.each($('.container .directory .list tbody *'), function (key, value) {
    $(value).addClass('toremove')
  })
  listDirectory(directory)
  $('.toremove').remove()
})

socket.on('update-d', function () {
  listD()
})

socket.on('start-t', function (data) {
  var notif = new Pnotif()
  notif.init('top-right', "<p style='padding: 10px; margin: 0px;'>Le torrent va commencer dans quelques instants.</p>", 10000)
  notif.draw()
})
