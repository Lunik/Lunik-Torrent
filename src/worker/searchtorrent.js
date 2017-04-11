'use strict'

/* var CPBAPI = require('cpasbien-api')
var CpasbienApi = new CPBAPI()
*/
var cloudscraper = require('cloudscraper')
var cheerio = require('cheerio')

/**
 * Search torrent.
 * @constructor
*/
function SearchTorrent () {
  this.url = new Buffer('aHR0cDovL3d3dy50b3JyZW50OS5iaXo=', 'base64').toString()
}

/**
 * Search a torrent.
 * @param {string} query - Torrent name to search.
 * @param {function} callback - Return function with informations.
*/
SearchTorrent.prototype.search = function (query, callback) {
  var self = this
  var search = function () {
    var torrents = {
      tv: {
        items: [],
        type: 'films'
      },
      mv: {
        items: [],
        type: 'series'
      }
    }

    cloudscraper.get(`${self.url}/search_torrent/films/${query}.html`, function (err, res, body) {
      if (err) {
        console.error(err)
      }
      var $ = cheerio.load(body)
      torrents.mv.items = self.parse($, $('.table tbody tr'))
      cloudscraper.get(`${self.url}/search_torrent/series/${query}.html`, function (err, res, body) {
        if (err) {
          console.error(err)
        }
        var $ = cheerio.load(body)

        torrents.tv.items = self.parse($, $('.table tbody').children('tr'))
        callback(torrents)
      })
    })
  }

  setTimeout(search)
}

/**
 * Search the latest torrents.
 * @param {function} callback - Return function with informations.
*/
SearchTorrent.prototype.latest = function (callback) {
  var self = this
  var latest = function () {
    var torrents = {
      tv: {
        items: [],
        type: 'films'
      },
      mv: {
        items: [],
        type: 'series'
      }
    }

    cloudscraper.get(`${self.url}/torrents_films.html`, function (err, res, body) {
      if (err) {
        console.error(err)
      }
      var $ = cheerio.load(body)
      torrents.mv.items = self.parse($, $('.table-responsive tbody tr'))
      cloudscraper.get(`${self.url}/torrents_series.html`, function (err, res, body) {
        if (err) {
          console.error(err)
        }
        var $ = cheerio.load(body)

        torrents.tv.items = self.parse($, $('.table-responsive tbody').children('tr'))
        callback(torrents)
      })
    })
  }

  setTimeout(latest)
}

SearchTorrent.prototype.parse = function ($, tr) {
  var self = this
  var array = []
  for (var key in tr) {
    if (!isNaN(key)) {
      var $line = $(tr[key])
      var torrent = {}
      torrent.title = $($line.children()[0]).find('a').text()
      torrent.size = $($line.children()[1]).text()
      torrent.seeds = $($($line.children()[2]).find('span')).text()
      torrent.leechs = $($line.children()[3]).text()
      torrent.torrent = `${self.url}/get_torrent/${$($line.children()[0]).find('a').attr('href').split('/').pop()}.torrent`
      array.push(torrent)
    }
  }

  return array
}
module.exports = new SearchTorrent()
