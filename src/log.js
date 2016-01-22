var fs = require('fs')

function Log() {
  this.config = require('./config.json')
}

Log.prototype.print = function(text) {
  console.log(text)
  fs.appendFile(this.config.log.path, '[' + getDate() + '] ' + text + '\n', 'utf8', function(err) {
    if (err) throw err
  })
}

function getDate() {
  var date = new Date()
  return date.getDate() + '/' + (date.getMonth() + 1) + ' ' + (date.getHours() + 1) + ':' + (date.getMinutes() + 1) + ':' + (date.getSeconds() + 1)
}

module.exports = new Log()
