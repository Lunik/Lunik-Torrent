var Storage = new _Storage()

/**
 * Media info manager.
*/
function _MediaInfo () {}

/**
 * Get media info from the server.
 * @param {string} title - Media title.
*/
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

/**
 * Get the Media info popup hmtl.
 * @param {object} data - Info on the media.
 * @return {object} - Jquery html element.
*/
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

/**
 * Create media info popup from data.
 * @param {object} data - Info on the media.
*/
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

/**
 * Clean the media title.
 * @param {string} title - Media title.
 * @return {string} - Clean media title.
*/
_MediaInfo.prototype.cleanTitle = function (title) {
  var f = new _Format()
  return f.name(title)
}

/**
 * Get type of the media (tvshow / movie).
 * @param {string} title - Media title.
 * @return {string} - Type of the media (films / series)
*/
_MediaInfo.prototype.getType = function (title) {
  title = title.toLowerCase()
  var regex = /s[0-9^e]*e[0-9]/
  if (title.search(regex) === -1) {
    return 'films'
  } else {
    return 'series'
  }
}
