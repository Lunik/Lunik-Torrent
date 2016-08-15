'use strict'

var checkUpdate = require('check-update-github')
var Path = require('path')

var pkg = require(Path.join(__base, 'package.json'))

checkUpdate({
  name: pkg.name,
  currentVersion: pkg.version,
  user: 'Lunik',
  branch: 'master'
}, function (err, latestVersion, defaultMessage) {
  if (!err) {
    console.log(defaultMessage)
  }
})
