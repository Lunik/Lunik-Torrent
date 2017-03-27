'use strict'

var allocine = require('allocine-api')

/**
 * MediaInfo requester.
 * @constructor
*/
class MediaInfo {

/**
 * Get Media Info from allocine.
 * @param {string} query - Media to search.
 * @param {string} type - Media type (tvseries, movie)
 * @param {string} code - Media code.
 * @param {function} callback - callback with iformation.
*/
  getMediaInfo (query, type, code, callback) {
    var getMediaInfo = () => {
      if (type === 'tvseries') {
        allocine.api('tvseries', {
          code: code
        }, (err, data) => {
          if (err) {
            callback({
              err: err
            })
            return
          }
          callback({
            'type': 'series',
            'query': query,
            'title': data.tvseries.title,
            'link': data.tvseries.link.length > 0 ? data.tvseries.link[0].href : '',
            'description': data.tvseries.synopsisShort.replace(/<\/*p>/g, ''),
            'poster': data.tvseries.poster ? data.tvseries.poster.href : '',
            'rating': `${Math.round((data.tvseries.statistics.pressRating + data.tvseries.statistics.userRating) / 2)}/5`
          })
        })
      } else if (type === 'movie') {
        allocine.api('movie', {
          code: code
        }, (err, data) => {
          if (err) {
            callback({
              err: err
            })
            return
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
    }

    setTimeout(getMediaInfo)
  }

/**
 * Search Media on allocine.
 * @param {string} type - Media type (tvseries, movie)
 * @param {string} query - Media to search.
 * @param {function} callback - callback with iformation.
*/
  search (type, query, callback) {
    var search = () => {
      if (type === 'tvseries') {
        allocine.api('search', {
          q: query,
          filter: 'tvseries'
        }, (err, data) => {
          if (err) {
            callback({
              err: err
            })
            return
          }
          if (data.feed.totalResults > 0) {
          // Maybe Change that
            while (data.feed.tvseries[0].length > 0 || data.feed.tvseries[0].yearStart < 2000) {
              data.feed.tvseries.shift()
            }
            this.getMediaInfo(query, type, data.feed.tvseries[0].code, callback)
          } else {
            callback({
              err: `Nothing found for "${query}".`
            })
            return
          }
        })
      } else if (type === 'movie') {
        allocine.api('search', {
          q: query,
          filter: 'movie'
        }, (err, data) => {
          if (err) {
            callback({
              err: err
            })
            return
          }
          if (data.feed.totalResults > 0) {
            this.getMediaInfo(query, type, data.feed.movie[0].code, callback)
          } else {
            callback({
              err: `Nothing found for "${query}".`
            })
            return
          }
        })
      }
    }

    setTimeout(search)
  }

/**
 * Get info about a Media.
 * @param {string} type - Media type (tvseries, movie)
 * @param {string} query - Media to search.
 * @param {function} callback - callback with iformation.
*/
  getInfo (type, query, callback) {
    var getInfo = () => {
      if (type === 'series') {
        this.search('tvseries', query, callback)
      } else if (type === 'films') {
        this.search('movie', query, callback)
      } else {
        callback({
          err: `Unknown type: ${type}`
        })
      }
    }

    setTimeout(getInfo)
  }
}
module.exports = new MediaInfo()
