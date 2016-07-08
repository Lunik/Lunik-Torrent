/**
 * Format modules.
 * @constructor
*/
function _Format () {}

/**
 * Format bytes to b/kb/mb/gb/tb.
 * @param {int} bytes - Bytes numbers.
 * @return {float} - Formated size.
*/
_Format.prototype.size = function (bytes) {
  var sizes = ['b', 'kb', 'mb', 'gb', 'tb']
  if (bytes === 0) { return '0 b' }
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

/**
 * Format speed to kb/s,mb/s.
 * @param {int} bytes - Bytes numbers.
 * @return {float} - Formated speed.
*/
_Format.prototype.speed = function (bytes) {
  return this.size(bytes) + '/s'
}

/**
 * Format Date to dd/mm/yyyy hh:mm:ss.
 * @param {Date} date - Date to format.
 * @return {string} - Formated date.
*/
_Format.prototype.date = function (date) {
  date = new Date(date)
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() /* + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() */
}

/**
 * Format seconds to 00j - 00h 00m 00s.
 * @param {int} time - Seconds.
 * @return {string} - Formated time.
*/
_Format.prototype.time = function (time) {
  var x = time / 1000
  var seconds = Math.round(x % 60)
  x /= 60
  var minutes = Math.round(x % 60)
  x /= 60
  var hours = Math.round(x % 24)
  x /= 24
  var days = Math.round(x)

  var returnString = ''

  if (days > 0) { returnString += days + 'j - ' }
  if (hours > 0) { returnString += hours + 'h ' }
  if (minutes > 0) { returnString += minutes + 'm ' }
  if (seconds > 0) { returnString += seconds + 's ' }

  return returnString
}

/**
 * Get the extention of a file.
 * @param {object} file - File infos.
 * @return {string} - Extension.
*/
_Format.prototype.extention = function (file) {
  if (file.isfile) {
    return file.name.split('.')[file.name.split('.').length - 1]
  } else {
    return 'dir'
  }
}

/**
 * Clean file name and lowercase.
 * @param {string} name - File name.
 * @return {string} - Cleaned name.
*/
_Format.prototype.name = function (name) {
  var bannedWords = ['dvdrip', 'fr', 'vo', 'vostfr', 'hdtv', 'webrip', 'bdrip']
  name = name.toLowerCase()
    .replace(/\.[a-z0-9]*$/, '') // remove extension
    .replace(/\./g, ' ') // point
    .replace(/s[0-9][0-9]e[0-9][0-9]/g, '') // numero d'episode
    .replace(/ $/, '') // espace en fin de chaine
  name = name.split(' ')
  var newName = []
  for (var key in name) {
    var mot = name[key]
    if (bannedWords.indexOf(mot) === -1) {
      newName.push(mot)
    }
  }
  return newName.join(' ')
}
