var socket = io()

socket.on('update-t', function() {
  listT()
})

socket.on('finish-t', function(hash) {
  $('.torrent[hash=' + hash + ']').remove()
})

socket.on('list-t', function(torrents) {
  listTorrent(torrents)
})

socket.on('list-d', function(directory) {
  appendDirectorySize(directory.totalSize)
  $.each($('.container .directory .list tbody *'), function(key, value) {
    $(value).addClass('toremove')
  })
  listDirectory(directory.files)
  $('.toremove').remove()
})

socket.on('update-d', function() {
  listD()
})

socket.on('start-t', function(data) {
  var notif = new Pnotif()
  notif.init('top-right', "<p style='padding: 10px; margin: 0px;'>Le torrent va commencer dans quelques instants.</p>", 10000)
  notif.draw()
})

socket.on('search-t', function(data) {
  var $searchDiv = $('.menu .search-result')

  if ($('.search-result .close-search').length <= 0) {
    var $closeBut = $('<button>').addClass('close-search').text('x').click(function() {
      $searchDiv.html('')
    }).appendTo($searchDiv)
  }

  if ($('.search-result .films').length <= 0) {
    $('<table>').addClass('films').html('<thead><th class="search-header">Films</th></thead>').appendTo($searchDiv)
  }
  var $films = $('.search-result .films')

  if ($('.search-result .series').length <= 0) {
    $('<table>').addClass('series').html('<thead><th class="search-header">Series</th></thead>').appendTo($searchDiv)
  }
  var $series = $('.search-result .series')

  data.data.items.forEach(function(element, index) {
    var $item = $('<tr>').addClass('search-item').attr('torrent-link', element.torrent)
    $('<td>').text(element.title).appendTo($item)
    $('<td>').text(element.size).appendTo($item)
    $('<td>').html($('<i>').addClass('fa fa-arrow-up').text(element.seeds)).appendTo($item)
    $('<td>').html($('<i>').addClass('fa fa-arrow-down').text(element.leechs)).appendTo($item)

    if (data.type == 'films') {
      $item.appendTo($films)
    } else if (data.type == 'series') {
      $item.appendTo($series)
    }

  })
})

socket.on('error-t', function(hash) {
  $('.torrent[hash=' + hash + ']').remove()
  var notif = new Pnotif()
  notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Erreur avec le torrent. Nouvelle tentative dans quelques instants</p>", 10000)
  notif.draw()
})

socket.on('infos-d', function(data){
  mediaInfoPopup(data)
  storeData(data.query.toLowerCase(), data);
})
