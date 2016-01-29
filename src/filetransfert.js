var config = require('./config.json')

var fs = require('fs')

function FileTransfert(req, res){
  if(config.nginx.active){
    this.transfertNginx(req, res)
  } else {
    this.transfertNode(req, res)
  }
}

FileTransfert.prototype.transfertNode = function(req, res){
  var filename = config.directory.path + req.query.f
  fs.stat(filename, function (err, stats) {
    if (stats) {
      res.setHeader('Content-disposition', 'attachment; filename="' + req.query.f.split('\/').pop() + '"')
      res.setHeader('Content-Length', stats.size)
      res.setHeader('Content-type', 'application/octet-stream')

      var fReadStream = fs.createReadStream(filename)
      fReadStream.pipe(res)
      fReadStream.on('end', function () {
        Log.print(req.user + ' finish download file: ' + req.query.f)
      })
      fReadStream.on('end', function () {
        Log.print(req.user + ' stop download file: ' + req.query.f)
      })
      fReadStream.on('error', function (err) {
        Log.print(req.user + ' error during download file: ' + req.query.f + '\n err: '+err)
      })
    } else {
      res.end("Le fichier n'existe pas")
    }
  })
}

FileTransfert.prototype.transfertNginx = function(req, res){
  res.redirect("http://localhost:"+config.nginx.port+"/"+config.nginx.path+"/"+req.query.f)
}
module.exports = FileTransfert
