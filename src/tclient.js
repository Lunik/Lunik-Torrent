var Log = require('./log.js')

var Client = require('./client.js')
process.on('message', function(data) {
  switch (data.type) {
    case 'download':
      Log.print('Child pid: ' + process.pid + ' start: ' + data.torrent)
      Client.download(data.torrent)
      Client.on('download', function(torrent) {
        process.send({
          'type': 'info',
          'torrent': torrent
        })
      })
      Client.on('done', function(torrentHash, torrentName) {
        process.send({
          'type': 'finish',
          'hash': torrentHash,
          'name': torrentName
        })
      })
    break

    case 'info':
      process.send({
        'type': 'info',
        'torrent': Client.getTorrent()
      })
    break

    case 'remove':
      var torrent = Client.getTorrent()
      process.send({
        'type': 'finish',
        'hash': torrent.hash,
        'name': torrent.name
      })
    break
  }
})
