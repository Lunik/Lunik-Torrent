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
  appendDirectorySize(directory.totalSize)
  $.each($('.container .directory .list tbody *'), function (key, value) {
    $(value).addClass('toremove')
  })
  listDirectory(directory.files)
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

socket.on('search-t', function (data) {
  console.log(data)
  var $searchTable = $('.menu .search-result')
  data.items.forEach(function (element, index) {
    var $item = $('<tr>').attr('torrent-link', element.torrent)
    $('<td>').text(element.title).appendTo($item)
    $('<td>').text(element.size).appendTo($item)
    $('<td>').html($('<i>').addClass('fa fa-arrow-up').text(element.seeds)).appendTo($item)
    $('<td>').html($('<i>').addClass('fa fa-arrow-down').text(element.leechs)).appendTo($item)
    $item.appendTo($searchTable)
  })
})
