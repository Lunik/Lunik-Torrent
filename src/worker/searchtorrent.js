'use strict'

var CPBAPI = require('cpasbien-api')
var CpasbienApi = new CPBAPI()

/**
 * Search torrent.
 * @constructor
*/
function SearchTorrent () {}

/**
 * Search a torrent.
 * @param {string} query - Torrent name to search.
 * @param {function} callback - Return function with informations.
*/
SearchTorrent.prototype.search = function (query, callback) {

  var search = function(){
    CpasbienApi.Search(query, {
      scope: 'tvshow',
      language: 'EN'
    }).then(function (data1) {
      data1.type = 'series'
      CpasbienApi.Search(query, {
        scope: 'tvshow',
        language: 'FR'
      }).then(function (data2) {
        data2.type = 'series'
        CpasbienApi.Search(query).then(function (data3) {
          data3.type = 'films'
          callback({
            tven: data1,
            tvfr: data2,
            mv: data3
          })
        })
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

  var latest = function(){
    CpasbienApi.Latest({
      scope: 'tvshow'
    }).then(function (data1) {
      data1.type = 'series'
      data1.items = data1.items.slice(0, 20)
      CpasbienApi.Latest().then(function (data2) {
        data2.type = 'films'
        data2.items = data2.items.slice(0, 20)
        callback({
          tv: data1,
          mv: data2
        })
      })
    })
  }

  setTimeout(latest)
}

module.exports = new SearchTorrent()
