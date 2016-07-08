var allocine = require('allocine-api')

/**
 * MediaInfo requester.
 * @constructor
*/
function MediaInfo () {}

/**
 * Get Media Info from allocine.
 * @param {string} query - Media to search.
 * @param {string} type - Media type (tvseries, movie)
 * @param {string} code - Media code.
 * @param {function} callback - callback with iformation.
*/
MediaInfo.prototype.getMediaInfo = function (query, type, code, callback) {
  setTimeout(function () {
    if (type === 'tvseries') {
      allocine.api('tvseries', {
        code: code
      }, function (err, data) {
        if (err) {
          console.log(err)
        }
        callback({
          'type': 'series',
          'query': query,
          'title': data.tvseries.title,
          'link': data.tvseries.link.length > 0 ? data.tvseries.link[0].href : '',
          'description': data.tvseries.synopsisShort,
          'poster': data.tvseries.poster ? data.tvseries.poster.href : '',
          'rating': (data.tvseries.statistics.pressRating + data.tvseries.statistics.userRating) / 2
        })
      })
    } else if (type === 'movie') {
      allocine.api('movie', {
        code: code
      }, function (err, data) {
        if (err) {
          console.log(err)
        }
        callback({
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
  }, 1)
}

/**
 * Search Media on allocine.
 * @param {string} type - Media type (tvseries, movie)
 * @param {string} query - Media to search.
 * @param {function} callback - callback with iformation.
*/
MediaInfo.prototype.search = function (type, query, callback) {
  var self = this
  setTimeout(function () {
    if (type === 'tvseries') {
      allocine.api('search', {
        q: query,
        filter: 'tvseries'
      }, function (err, data) {
        if (err) {
          console.log(err)
        }
        if (data.feed.totalResults > 0) {
          // Maybe Change that
          while (data.feed.tvseries[0].length > 0 || data.feed.tvseries[0].yearStart < 2000) {
            data.feed.tvseries.shift()
          }
          self.getMediaInfo(query, type, data.feed.tvseries[0].code, callback)
        }
      })
    } else if (type === 'movie') {
      allocine.api('search', {
        q: query,
        filter: 'movie'
      }, function (err, data) {
        if (err) {
          console.log(err)
        }
        if (data.feed.totalResults > 0) {
          self.getMediaInfo(query, type, data.feed.movie[0].code, callback)
        }
      })
    }
  }, 1)
}

/**
 * Get info about a Media.
 * @param {string} type - Media type (tvseries, movie)
 * @param {string} query - Media to search.
 * @param {function} callback - callback with iformation.
*/
MediaInfo.prototype.getInfo = function (type, query, callback) {
  var self = this
  setTimeout(function () {
    if (type === 'series') {
      self.search('tvseries', query, callback)
    } else if (type === 'films') {
      self.search('movie', query, callback)
    }
  }, 1)
}

module.exports = new MediaInfo()
