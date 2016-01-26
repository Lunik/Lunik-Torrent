function searchTorrent(query){
  $.post('/search-t', {query: query}, function(data){
    data = JSON.parse(data)
    for (var key in data){
      afficheSearchTorrent(data[key])
    }
  })
}

function afficheSearchTorrent(data){
  var $searchDiv = $('.menu .search-result')

  if ($('.search-result .close-search').length <= 0) {
    var $closeBut = $('<button>').addClass('close-search').text('x').click(function () {
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

  data.items.forEach(function (element, index) {
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
}
