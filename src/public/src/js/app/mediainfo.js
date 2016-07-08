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

  var $html = $('<div/>').addClass('Content')

  $('<img/>').attr('src', data.poster).attr('alt', data.title + ' poster').appendTo($html)

  var $infos = $('<div/>').addClass('infos')

  $('<div/>').addClass('rating').text(Math.round(data.rating) + '/5').appendTo($infos)

  var $synopsis = $('<div/>').addClass('synopsis').html(data.description)
  $('<br><a/>').addClass('button').attr('target', '_blank').attr('href', data.link).text('Fiche Allocine...').appendTo($synopsis)
  $infos.append($synopsis)

  $html.append($infos)

  html.content = $html
  return html
}

_MediaInfo.prototype.popup = function (data) {
  var html = this.html(data)
  $.popupjs.init({
    pos: {
      x: null,
      y: '5%'
    },
    width: '90%',
    height: '90%',
    title: html.title,
    html: html.content,
    closeBut: true
  })
  $.popupjs.draw()
}

_MediaInfo.prototype.cleanTitle = function (title) {
  var bannedWords = ['dvdrip', 'fr', 'vo', 'vostfr', 'hdtv', 'webrip', 'bdrip']
  title = title.toLowerCase()
    .replace(/\.[a-z0-9]*$/, '') // remove extension
    .replace(/\./g, ' ') // point
    .replace(/s[0-9][0-9]e[0-9][0-9]/g, '') // numero d'episode
    .replace(/ $/, '') // espace en fin de chaine
  title = title.split(' ')
  var newTitle = []
  for (var key in title) {
    var mot = title[key]
    if (bannedWords.indexOf(mot) == -1) {
      newTitle.push(mot)
    }
  }
  return newTitle.join(' ')
}

_MediaInfo.prototype.getType = function (title) {
  title = title.toLowerCase()
  var regex = /s[0-9^e]*e[0-9]/
  if (title.search(regex) === -1) {
    return 'films'
  } else {
    return 'series'
  }
}
