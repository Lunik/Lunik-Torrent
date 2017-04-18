var Path = require('path')
var Torrent = require(Path.join(__workingDir, 'worker/torrent'))
var Directory = require(Path.join(__workingDir, 'worker/directory'))

Torrent.Directory = Directory

var SearchEngine = require(Path.join(__workingDir, 'worker/searchtorrent'))
var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Server'
})

function Router (app) {
  app.get('/torrent', function (req, res) {
    res.header('Content-Type', 'application/json')
    res.end(JSON.stringify({
      GET: [
        'list'
      ],
      POST: [
        'download',
        'remove',
        'search'
      ]
    }))
  })

// client start torrent
  app.post('/torrent/download', function (req, res) {
    if (req.body.url) {
      LogWorker.info(`${req.cookies.user} download torrent: ${req.body.url}`)
      Torrent.start(req.cookies.user, req.body.url)
      res.end(JSON.stringify({}))
    } else {
      res.end(JSON.stringify({
        err: 'Wrong url.'
      }))
    }
  })

// client ask list of torrent active
  app.get('/torrent/list', function (req, res) {
    Torrent.getInfo(function (data) {
      res.end(JSON.stringify(data))
    })
  })

// client remove torrent
  app.post('/torrent/remove', function (req, res) {
    if (req.body.hash) {
      LogWorker.info(`${req.cookies.user} remove torrent: ${req.body.hash}`)
      Torrent.remove(req.body.hash)
      res.end(JSON.stringify({
        hash: req.body.hash
      }))
    } else {
      res.end(JSON.stringify({
        err: 'Wrong hash.'
      }))
    }
  })

// client search torrent
  app.post('/torrent/search', function (req, res) {
    if (req.body.query && req.body.query !== '') {
      req.body.query = req.body.query.replace(/%20/g, ' ')
      LogWorker.info(`${req.cookies.user} search: ${req.body.query}`)
      SearchEngine.search(req.body.query, function (data) {
        res.end(JSON.stringify(data))
      })
    } else {
      SearchEngine.latest(function (data) {
        res.end(JSON.stringify(data))
      })
    }
  })
}
module.exports = Router
