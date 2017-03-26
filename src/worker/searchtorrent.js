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
class SearchTorrent {
  constructor () {
    this.url = new Buffer('aHR0cDovL3d3dy50b3JyZW50OS5iaXo=', 'base64').toString()
  }

/**
 * Search a torrent.
 * @param {string} query - Torrent name to search.
 * @param {function} callback - Return function with informations.
*/
  search (query, callback) {
    var search = () => {
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

      cloudscraper.get(`${this.url}/search_torrent/films/${query}.html`, (err, res, body) => {
        if (err) {
          console.error(err)
        }
        var $ = cheerio.load(body)
        torrents.mv.items = this.parse($, $('.table tbody tr'))
        cloudscraper.get(`${this.url}/search_torrent/series/${query}.html`, (err, res, body) => {
          if (err) {
            console.error(err)
          }
          var $ = cheerio.load(body)

          torrents.tv.items = this.parse($, $('.table tbody').children('tr'))
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
  latest (callback) {
    var latest = () => {
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

      cloudscraper.get(`${this.url}/torrents_films.html`, (err, res, body) => {
        if (err) {
          console.error(err)
        }
        var $ = cheerio.load(body)
        torrents.mv.items = this.parse($, $('.table-responsive tbody tr'))
        cloudscraper.get(`${this.url}/torrents_series.html`, (err, res, body) => {
          if (err) {
            console.error(err)
          }
          var $ = cheerio.load(body)

          torrents.tv.items = this.parse($, $('.table-responsive tbody').children('tr'))
          callback(torrents)
        })
      })
    }

    setTimeout(latest)
  }

  parse ($, tr) {
    var array = []
    for (var key in tr) {
      if (!isNaN(key)) {
        var $line = $(tr[key])
        var torrent = {}
        torrent.title = $($line.children()[0]).find('a').text()
        torrent.size = $($line.children()[1]).text()
        torrent.seeds = $($($line.children()[2]).find('span')).text()
        torrent.leechs = $($line.children()[3]).text()
        torrent.torrent = `${this.url}/get_torrent/${$($line.children()[0]).find('a').attr('href').split('/').pop()}.torrent`
        torrent.cover = `${this.url}/_pictures/${$($line.children()[0]).find('a').attr('href').split('/').pop()}.jpg`
        array.push(torrent)
      }
    }

    return array
  }
}
module.exports = new SearchTorrent()
