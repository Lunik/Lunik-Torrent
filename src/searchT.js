var Log  = require('./log.js')

var CPBAPI = require('cpasbien-api')
var CpasbienApi = new CPBAPI()

function SearchT() {

}

SearchT.prototype.search = function(query, socket) {
  Log.print('Search: ' + query)
  CpasbienApi.Search(query, {
    scope: 'tvshow',
    language: 'FR'
  }).then(function(data) {
    socket.emit('search-t', {
      'type': 'series',
      'data': data
    })
  })

  CpasbienApi.Search(query, {
    scope: 'tvshow',
    language: 'EN'
  }).then(function(data) {
    socket.emit('search-t', {
      'type': 'series',
      'data': data
    })
  })

  CpasbienApi.Search(query).then(function(data) {
    socket.emit('search-t', {
      'type': 'films',
      'data': data
    })
  })
}

SearchT.prototype.latest = function(socket) {
  CpasbienApi.Latest({
    scope: 'tvshow'
  }).then(function(data) {
    data.items = data.items.slice(0, 10)
    socket.emit('search-t', {
      'type': 'series',
      'data': data
    })
  })
  CpasbienApi.Latest().then(function(data) {
    data.items = data.items.slice(0, 10)
    socket.emit('search-t', {
      'type': 'films',
      'data': data
    })
  })
}

var instaSearchT = new SearchT()
module.exports = instaSearchT
