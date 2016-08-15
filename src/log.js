'use strict'

var fs = require('fs')
var Path = require('path')

/**
 *  Log manager.
 * @constructor
*/
function Log () {}

/**
 *  Write log into .txt and log it on the screen.
 * @param {string} text - Text to log.
*/
Log.prototype.print = function (text) {
  var self = this
  setTimeout(function () {
    self.echo(text)
    fs.appendFile(Path.join(__config.log.path, 'log-' + (new Date()).getDate() + '-' + ((new Date()).getMonth() + 1)), '[' + getDate() + '] ' + text + '\n', 'utf8', function (err) {
      if (err) throw err
    })
  })
}

/**
 *  Write log on the screen.
 * @param {string} text - Text to log.
*/
Log.prototype.echo = function (text) {
  console.log(text)
}

function getDate () {
  var date = new Date()
  return date.getDate() + '/' + (date.getMonth() + 1) + ' ' + (date.getHours() + 1) + ':' + (date.getMinutes() + 1) + ':' + (date.getSeconds() + 1)
}

module.exports = new Log()
