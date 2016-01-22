var allocine = require('allocine-api')

function MediaInfo () {
}

MediaInfo.prototype.getMediaInfo = function (query, type, code, socket) {
  if (type == 'tvseries') {
    allocine.api('tvseries', {
      code: code
    }, function (err, data) {
      socket.emit('infos-d', {
        'type': 'series',
        'query': query,
        'title': data.tvseries.title,
        'link': data.tvseries.link.length > 0 ? data.tvseries.link[0].href : '',
        'description': data.tvseries.synopsisShort,
        'poster': data.tvseries.poster ? data.tvseries.poster.href : '',
        'rating': (data.tvseries.statistics.pressRating + data.tvseries.statistics.userRating) / 2
      })
    })
  } else if (type == 'movie') {
    allocine.api('movie', {
      code: code
    }, function (err, data) {
      socket.emit('infos-d', {
        'type': 'films',
        'query': query,
        'title': data.movie.title,
        'link': data.movie.link[0].href,
        'description': data.movie.synopsisShort,
        'poster': data.movie.poster ? data.movie.poster.href : '',
        'rating': (data.movie.statistics.pressRating + data.movie.statistics.userRating) / 2
      })
    })
  }
}

MediaInfo.prototype.search = function (type, query, socket) {
  if (type == 'tvseries') {
    allocine.api('search', {
      q: query,
      filter: 'tvseries'
    }, function (err, data) {
      if (data.feed.totalResults > 0) {
        instMediaInfo.getMediaInfo(query, type, data.feed.tvseries[0].code, socket)
      }
    })
  } else if (type == 'movie') {
    allocine.api('search', {
      q: query,
      filter: 'movie'
    }, function (err, data) {
      if (data.feed.totalResults > 0) {
        instMediaInfo.getMediaInfo(query, type, data.feed.movie[0].code, socket)
      }
    })
  }
}
MediaInfo.prototype.getInfo = function (type, query, socket) {
  if (type == 'series') {
    this.search('tvseries', query, socket)
  } else if (type == 'films') {
    this.search('movie', query, socket)
  }
}

var instMediaInfo = new MediaInfo()
module.exports = instMediaInfo
