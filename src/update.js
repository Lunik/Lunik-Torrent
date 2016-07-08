var checkUpdate = require('check-update-github')
var path = require('path')

var pkg = require(path.join(__dirname, '/../package.json'))

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
