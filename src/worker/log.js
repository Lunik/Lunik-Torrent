'use strict'

var fs = require('fs')
var Path = require('path')
var colors = require('colors')

/**
 *  Log manager.
 * @constructor
*/
class Log {
  constructor (options) {
    if (!options) options = {}
    this.module = options.module || 'Default'
  }

  info (text) {
    text = `[${this.module}] ${colors.green.bold('[Info] ')}${text}`
    this.echo(text)
    this.save(colors.strip(text))
  }

  warning (text) {
    text = `[${this.module}] ${colors.yellow.bold('[Warning] ')}${text}`
    this.echo(text)
    this.save(colors.strip(text))
  }

  error (text) {
    text = `[${this.module}] ${colors.red.bold('[Error] ')}${colors.red(text)}`
    this.trace(text)
    this.save(colors.strip(text))
  }
/**
 *  Write log into .txt and log it on the screen.
 * @param {string} text - Text to log.
*/
  save (text) {
    var save = () => {
      var name = this.getFile()
      fs.appendFile(name, `[${getDate()}] ${text}
`, 'utf8', (err) => {
  if (err) this.echo(`${colors.red.bold('[Error] ')}${err}`)
})
    }
    setTimeout(save)
  }

/**
 *  Write log on the screen.
 * @param {string} text - Text to log.
*/
  echo (text) {
    console.log(text)
  }

  trace (text) {
    console.log(text)
    console.trace()
  }

  getFile () {
    var date = new Date()
    return Path.join(__config.log.path, `log-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`)
  }
}

function getDate () {
  var date = new Date()
  return formatDateNumbers(`${formatDateNumbers(date.getDate())}/${formatDateNumbers(date.getMonth() + 1)}/${formatDateNumbers(date.getFullYear())} ${formatDateNumbers(date.getHours())}:${formatDateNumbers(date.getMinutes())}:${formatDateNumbers(date.getSeconds())}`)
}

function formatDateNumbers (num) {
  num = num.toString()
  while (num.length < 2) {
    num = `0${num}`
  }
  return num
}
module.exports = Log
