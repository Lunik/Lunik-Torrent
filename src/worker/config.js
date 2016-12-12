'use strict'

var assert = require('assert')

function Config () {
}

Config.prototype.load = function (path) {
  var config = require(path)

  assert(config, messageError('config'))

  assert(config.log, messageError('log'))
  assert(config.log.path, messageError('log.path'))

  assert(config.database, messageError('database'))
  assert(config.database.port, messageError('database.port'))

  assert(config.server, messageError('server'))
  assert(config.server.port, messageError('server.port'))
  assert(config.server.authentification === true || config.server.authentification === false ? true : false, messageError('server.authentification'))
  assert(config.server.invitationKey, messageError('server.invitationKey'))

  assert(config.client, messageError('client'))
  assert(config.client.downloads, messageError('client.downloads'))
  assert(config.client.updateTimeout, messageError('client.updateTimeout'))
  assert(config.client.timeout, messageError('client.timeout'))
  assert(config.client.maxTry, messageError('client.maxTry'))

  assert(config.directory, messageError('directory'))
  assert(config.directory.path, messageError('directory.path'))

  assert(config.torrent, messageError('torrent'))
  assert(config.torrent.downloads, messageError('torrent.downloads'))
  assert(config.torrent.scanTorrent, messageError('torrent.scanTorrent'))
  assert(config.torrent.max, messageError('torrent.max'))

  return config
}

function messageError (field) {
  return `Config Error: ${field} is missing.`
}
module.exports = Config
