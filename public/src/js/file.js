function formatSize (bytes) {
  var sizes = ['b', 'kb', 'mb', 'gb', 'tb']
  if (bytes == 0) return '0 b'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

function formatSpeed (bytes) {
  return formatSize(bytes) + '/s'
}

function formatDate (date) {
  // return date
  var date = new Date(date)
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes()
}

function formatTime (time) {
  var x = time / 1000
  var seconds = Math.round(x % 60)
  x /= 60
  var minutes = Math.round(x % 60)
  x /= 60
  var hours = Math.round(x % 24)
  x /= 24
  var days = Math.round(x)

  var returnString = ''

  if (days > 0) returnString += days + 'j - '
  if (hours > 0) returnString += hours + 'h '
  if (minutes > 0) returnString += minutes + 'm '
  if (seconds > 0) returnString += seconds + 's '

  return returnString
}

function getExtention (file) {
  if (file.isfile)
    return file.name.split('.')[file.name.split('.').length - 1]
  else
    return 'dir'
}

function formatName (name) {
  name = name.replace(/\.[A-Za-z0-9]*$/, '')
    .replace(/\[[^\]]*]/, '')
    .replace(/[ \.](([Ff][Rr])|([Vv][Oo])|(VOSTFR)|(FASTSUB)|(HDTV)|(XviD-ARK01)|(FRENCH))/g, '')
    .replace(/\./g, ' ') // point
    .replace(/ $/, '') // espace en fin de chaine

  return name
}
