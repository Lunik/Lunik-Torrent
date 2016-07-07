function _SearchTorrent () {
  this.torrentInput = $('.left-menu .torrent-input input')
}

_SearchTorrent.prototype.search = function (query) {
  var self = this
  $.post('/search-t', {
    query: query
  }, function (data) {
    data = JSON.parse(data)
    self.show(data)
  })
}

_SearchTorrent.prototype.show = function (data) {
  $.popupjs.init({
    pos: {
      x: null,
      y: '5%'
    },
    width: '90%',
    height: '90%',
    title: 'Search',
    html: this.getHtml(data),
    closeBut: true
  })
  $.popupjs.draw()
}

_SearchTorrent.prototype.getHtml = function (data) {
  var self = this
  var $searchDiv = $('<div>').addClass('search-result')

  var $films = $('<table>').addClass('films').html('<thead><th class="search-header">Films</th></thead>')

  var $series = $('<table>').addClass('series').html('<thead><th class="search-header">Series</th></thead>')

  for (var key in data) {
    data[key].items.forEach(function (element, index) {
      var $item = $('<tr>').addClass('search-item button').click(function () {
        $.popupjs.remove()
        self.torrentInput.val(element.torrent)
        self.torrentInput.trigger('keyup')
      })
      $('<td>').addClass('img').append(
        $('<img>').attr('src', element.cover).hover(function(event){
          $(this).width($(this).width() * 2)
        }, function(){
          $(this).width($(this).width() / 2)
        })
      ).appendTo($item)
      $('<td>').text(element.title).appendTo($item)
      $('<td>').text(element.size).appendTo($item)
      $('<td>').addClass('seed').html($('<i>').addClass('fa fa-arrow-up').text(element.seeds)).appendTo($item)
      $('<td>').addClass('peer').html($('<i>').addClass('fa fa-arrow-down').text(element.leechs)).appendTo($item)

      if (data[key].type === 'films') {
        $item.appendTo($films)
      } else if (data[key].type === 'series') {
        $item.appendTo($series)
      }
    })
  }

  $films.appendTo($searchDiv)
  $series.appendTo($searchDiv)

  return $searchDiv
}
