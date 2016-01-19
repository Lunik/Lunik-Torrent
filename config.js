module.exports = {
  PORT: 80,
  FILES: __dirname + '/files/', //Media files directory
  DOWNLOADS: __dirname + '/downloads/', //Currently downloading torrent files directory
  TORRENTS: __dirname + '/torrents.txt', //File scaned to start torrent
  LOGS: __dirname + '/log.txt', //Log file
  HTPASSWD: __dirname + '/.htpasswd' //Authentification file for web application
}
