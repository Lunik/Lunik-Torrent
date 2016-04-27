var config = require('./config.json')

var fs = require('fs')

function Log () {}

Log.prototype.print = function (text) {
  setTimeout(function () {
    console.log(text)
    fs.appendFile(config.log.path + 'log-' + (new Date()).getDate() + '-' + ((new Date()).getMonth() + 1), '[' + getDate() + '] ' + text + '\n', 'utf8', function (err) {
      if (err) throw err
    })
  })
}

Log.prototype.echo = function (text) {
  console.log(text)
}

function getDate () {
  var date = new Date()
  return date.getDate() + '/' + (date.getMonth() + 1) + ' ' + (date.getHours() + 1) + ':' + (date.getMinutes() + 1) + ':' + (date.getSeconds() + 1)
}

module.exports = new Log()
