var Storage = new _Storage()

function _MediaInfo () {}

_MediaInfo.prototype.get = function (title) {
  var self = this
  title = title.toLowerCase()
  var type = this.getType(title)
  title = this.cleanTitle(title)
  if (Storage.readData(title) != null) {
    this.popup(Storage.readData(title))
  } else {
    $.post('/info-d', {
      type: type,
      query: title
    }, function (data) {
      data = JSON.parse(data)
      self.popup(data)
      Storage.storeData(data.query.toLowerCase(), data)
    })
  }
}

_MediaInfo.prototype.html = function (data) {
  var html = {}
  html.title = $('<a/>').attr('href', data.link).text(data.title)

  $html = $('<div/>').addClass('Content')

  $image = $('<img/>').attr('src', data.poster).attr('alt', data.title + ' poster')
  $html.append($image)

  $infos = $('<div/>').addClass('infos')

  $rating = $('<div/>').addClass('rating').text(Math.round(data.rating) + '/5')
  $infos.append($rating)

  $synopsis = $('<div/>').addClass('synopsis').html(data.description)
  $lirelasuite = $('<br><a/>').addClass('button').attr('target', '_blank').attr('href', data.link).text('Fiche Allocine...')
  $synopsis.append($lirelasuite)
  $infos.append($synopsis)

  $html.append($infos)

  html.content = $html
  return html
}

_MediaInfo.prototype.popup = function (data) {
  var p = new _Popup()
  var html = this.html(data)
  p.init(null, '5%', '90%', '90%', html.title, html.content, true)
  p.draw()
}

_MediaInfo.prototype.cleanTitle = function (title) {
  title = title.toLowerCase()
    .replace(/\.[a-z0-9]*$/, '') // remove extension
    .replace(/s[0-9][0-9]e[0-9][0-9]/g, '') // numero d'episode
    .replace(/[ \.]((french)|(dvdrip)|(xvid-trs)|(fr)|(vo)|(vostfr)|(fastub)|(hdtv)|(xvid-ark01)|(webrip)|(bdrip))/g, '') // remove useless stuff
    .replace(/\./g, ' ') // point
    .replace(/ $/, '') // espace en fin de chaine

  return title
}

_MediaInfo.prototype.getType = function (title) {
  var regex = /[Ss][0-9^E^e]*[Ee][0-9]/
  if (title.search(regex) === -1) {
    return 'films'
  } else {
    return 'series'
  }
}
