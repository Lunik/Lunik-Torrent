'use strict'

var Path = require('path')
var spawn = require('child_process').spawn
var version = require('version')

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Update'
})

var pkg = require(Path.join(__base, 'package.json'))

function Update (cb) {
  version.fetch('lunik-torrent', function (error, version) {
    if (error) {
      LogWorker.error(error)
      exit(1)
    } else {
      if (version === pkg.version) {
        LogWorker.info('You have the last version: ' + version)
        cb()
      } else {
        LogWorker.warning("You don't have the last version: " + version)
        if (__config.autoUpdate) {
          LogWorker.info('Auto updating the app.')
          var pull = spawn('git', ['pull'])
          bat.stdout.on('data', (data) => {
            LogWorker.info(data)
          })
          pull.on('exit', (code) => {
            if(code){
              Log.error('Git pull fail with code: ' + code)
              exit(1)
            }
            var checkout = spawn('git', ['checkout', 'tags/' + version])
            checkout.stdout.on('data', (data) => {
              LogWorker.info(data)
            })
            checkout.on('exit', (code) => {
              if(code){
                Log.error('Git pull fail with code: ' + code)
                exit(1)
              }
              LogWorker.info('Update to ' + version + 'succeed.')
              cb()
            })
          })
        } else {
          LogWorker.warning('Auto update is disabled.')
          cb()
        }
      }
    }
  })
}
module.exports = Update
