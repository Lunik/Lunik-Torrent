'use strict'

var assert = require('assert')

function Config () {
}

Config.prototype.load = function (path) {
  var config = require(path)

  assert(config, messageError('config'))

  assert(config.log, messageError('log'))
  assert(config.log.path, messageError('log.path'))

  assert(config.server, messageError('server'))
  assert(config.server.port, messageError('server.port'))
  assert(config.server.masterKey, messageError('server.masterKey'))
  assert(config.server.duplication, messageError('server.duplication'))
  assert(config.server.https === false || config.server.https, messageError('server.https'))
  if (config.server.https) {
    assert(config.server.hostname, messageError('server.hostname'))
    assert(config.server.certs.privatekey, messageError('server.certs.privatekey'))
    assert(config.server.certs.certificate, messageError('server.certs.certificate'))
    assert(config.server.certs.chain, messageError('server.certs.chain'))
  }

  assert(config.authentification, messageError('authentification'))
  assert(config.authentification.status === false || config.authentification.status, messageError('authentification.status'))

  assert(config.database, messageError('database'))
  assert(config.database.port, messageError('database.port'))
  assert(config.database.host, messageError('database.host'))

  assert(config.client, messageError('client'))
  assert(config.client.downloads, messageError('client.downloads'))
  assert(config.client.updateTimeout, messageError('client.updateTimeout'))
  assert(config.client.timeout, messageError('client.timeout'))

  assert(config.directory, messageError('directory'))
  assert(config.directory.path, messageError('directory.path'))

  assert(config.torrent, messageError('torrent'))
  assert(config.torrent.downloads, messageError('torrent.downloads'))
  assert(config.torrent.scanTorrent, messageError('torrent.scanTorrent'))

  return config
}

function messageError (field) {
  return `Config Error: ${field} is missing.`
}
module.exports = Config
