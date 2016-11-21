'use strict'

var fs = require('fs')
var Path = require('path')
var colors = require('colors')

/**
 *  Log manager.
 * @constructor
*/
function Log (options) {
  if (!options) options = {}
  this.module = options.module || 'Default'
}

Log.prototype.info = function (text) {
  text = `[${this.module}] ${colors.green.bold('[Info] ')}${text}`
  this.echo(text)
  this.save(colors.strip(text))
}

Log.prototype.warning = function (text) {
  text = `[${this.module}] ${colors.yellow.bold('[Warning] ')}${text}`
  this.echo(text)
  this.save(colors.strip(text))
}

Log.prototype.error = function (text) {
  text = `[${this.module}] ${colors.red.bold('[Error] ')}${colors.red(text)}`
  this.trace(text)
  this.save(colors.strip(text))
}
/**
 *  Write log into .txt and log it on the screen.
 * @param {string} text - Text to log.
*/
Log.prototype.save = function (text) {
  var self = this
  var save = function(){
    var name = Path.join(__config.log.path, `log-${(new Date()).getDate()}-${((new Date()).getMonth() + 1)}`)
    fs.appendFile(name, `[${getDate()}] ${text}\n`, 'utf8', function (err) {
      if (err) self.echo(`${colors.red.bold('[Error] ')}${err}`)
    })
  }
  setTimeout(save)
}

/**
 *  Write log on the screen.
 * @param {string} text - Text to log.
*/
Log.prototype.echo = function (text) {
  console.log(text)
}

Log.prototype.trace = function(text){
  console.log(text)
  console.trace()
}
function getDate () {
  var date = new Date()
  return formatDateNumbers(`${formatDateNumbers(date.getDate())}/${formatDateNumbers(date.getMonth() + 1)}/${formatDateNumbers(date.getFullYear())} ${formatDateNumbers(date.getHours())}:${formatDateNumbers(date.getMinutes())}:${formatDateNumbers(date.getSeconds())}`)
}

function formatDateNumbers(num){
  num = num.toString()
  while (num.length < 2) {
    num = `0${num}`
  }
  return num
}
module.exports = Log
