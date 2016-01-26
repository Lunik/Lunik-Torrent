var Log = require('./log.js')

var CPBAPI = require('cpasbien-api')
var CpasbienApi = new CPBAPI()

function SearchT () {
}

SearchT.prototype.search = function (query, callback) {
  Log.print('Search: ' + query)
  CpasbienApi.Search(query, {
    scope: 'tvshow',
    language: 'FR'
  }).then(function (data1) {
    CpasbienApi.Search(query, {
      scope: 'tvshow',
      language: 'EN'
    }).then(function (data2) {
      CpasbienApi.Search(query).then(function (data3) {
        callback({tvfr: data1, tven: data2, mv: data3})
      })
    })
  })
}

SearchT.prototype.latest = function (callback) {
  CpasbienApi.Latest({
    scope: 'tvshow'
  }).then(function (data1) {
    CpasbienApi.Latest().then(function (data2) {
      callback({tv: data1, mv: data2})
    })
  })
}

var instaSearchT = new SearchT()
module.exports = instaSearchT
