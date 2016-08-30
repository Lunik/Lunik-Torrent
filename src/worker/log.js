'use strict'

var fs = require('fs')
var Path = require('path')
var colors = require('colors')

/**
 *  Log manager.
 * @constructor
*/
function Log (options) {
	if(!options) options = {}
	this.module = options.module || 'Default'
}

Log.prototype.info = function(text){
	text = '[' + this.module + '] ' + colors.green.bold('[Info] ') + text
	this.echo(text)
	this.save(colors.strip(text))
}

Log.prototype.warning = function(text){
	text = '[' + this.module + '] ' + colors.yellow.bold('[Warning] ') + text
	this.echo(text)
	this.save(colors.strip(text))
}

Log.prototype.error = function(text){
	text = '[' + this.module + '] ' + colors.red.bold('[Error] ') + colors.red(text)
	this.echo(text)
	this.save(colors.strip(text))
}
/**
 *  Write log into .txt and log it on the screen.
 * @param {string} text - Text to log.
*/
Log.prototype.save = function (text) {
  var name = Path.join(__config.log.path, 'log-' + (new Date()).getDate() + '-' + ((new Date()).getMonth() + 1))
  fs.appendFile(name, text + '\n', 'utf8', function (err) {
    if (err) this.echo(colors.red.bold('[Error] ') + err)
  })
}

/**
 *  Write log on the screen.
 * @param {string} text - Text to log.
*/
Log.prototype.echo = function (text) {
  console.log(text)
}

module.exports = Log
