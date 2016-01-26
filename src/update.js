var checkUpdate = require('check-update-github')
var pkg = require(__dirname + '/../package.json')

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
