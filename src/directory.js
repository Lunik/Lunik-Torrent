var Log = require('./log.js')
var config = require('./config.json')
var fs = require('fs')

function Directory () {
  var self = this
  this.dir = {}
  this.downloading = {}

  setInterval(function(){
    self.updateDownloads()
  }, 30000)
}

Directory.prototype.list = function (dir) {
  if (this.dir[dir] == null) {
    this.dir[dir] = this.getDir(dir)
  } else {
    var s = fs.statSync(config.directory.path + dir)
    if (this.dir[dir].mtime < s.mtime) {
      this.dir[dir] = this.getDir(dir)
    }
  }

  return {
    'totalSize': this.dir[dir].totalSize,
    'files': this.dir[dir].files,
    'downloading':this.downloading
  }
}

Directory.prototype.getDir = function (dir) {
  var list = {}
  var totalSize = 0
  var files = fs.readdirSync(config.directory.path + dir)

  if (files.length > 0) {
    files.forEach(function (file) {
      var stats = instDirectory.getInfo(config.directory.path + dir + file)
      list[file] = stats
      totalSize += stats.size
    })
  }

  var s = fs.statSync(config.directory.path + dir)
  return {
    'mtime': s.mtime,
    'totalSize': totalSize,
    'files': list
  }
}

Directory.prototype.getInfo = function (file) {
  var stats = fs.statSync(file)
  var sfile = {}
  if (stats.isFile()) {
    sfile = stats
  } else {
    stats.size = sizeRecursif(file)
    sfile = stats
  }
  sfile.isfile = stats.isFile()
  sfile.isdir = stats.isDirectory()
  return sfile
}

Directory.prototype.setDownloading = function (file) {
  this.downloading[file] = this.downloading[file] ?
    {date: new  Date(), count: this.downloading[file].count + 1} :
    {date: new Date(), count: 1}
}

Directory.prototype.finishDownloading = function (file) {
  this.downloading[file] = this.downloading[file] ?
    {date: this.downloading[file].date, count: this.downloading[file].count + 1} :
    {date: this.downloading[file].date, count: 0}

  if (this.downloading[file] >= 0) {
    delete this.downloading[file]
  }
}

Directory.prototype.updateDownloads = function(){
  var curDate = new Date();
  for(var key in this.downloading){
    //if downloading for more than 1 hour remove
    if(curDate - this.downloading[key].date > 3600000){
      console.log(key)
      delete this.downloading[key]
    }
  }
}

Directory.prototype.isDownloading = function (file) {
  file = file[0] == '/' ? file.substring(1) : file;
  return this.downloading[file] ? true : false
}

Directory.prototype.remove = function (file) {
  if (this.isDownloading(file)) return -1
  fs.stat(config.directory.path + file, function (err, stats) {
    if (err) Log.print(err)
    if (stats) {
      if (stats.isDirectory()) {
        removeRecursif(config.directory.path + file)
      } else {
        fs.unlink(config.directory.path + file, function (err) {
          if (err) Log.print(err)
        })
      }
    }
  })

}

Directory.prototype.rename = function (path, oldname, newname) {
  if (this.isDownloading(path + oldname)) return -1
  fs.rename(config.directory.path + path + oldname, config.directory.path + path + '/' + newname, function (err) {
    if (err) Log.print(err)
  })
}

Directory.prototype.mkdir = function (path, name) {
  fs.mkdir(config.directory.path + path + name, function (err) {
    if (err) Log.print(err)
  })
}

Directory.prototype.mv = function (path, file, folder) {
  if (this.isDownloading(path + file)) return -1
  fs.rename(config.directory.path + path + file, config.directory.path + path + folder + '/' + file, function (err) {
    if (err) Log.print(err)
  })
}

function removeRecursif (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        removeRecursif(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

function sizeRecursif (path) {
  var size = 0
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        size += sizeRecursif(curPath)
      } else { // read size
        size += fs.statSync(curPath).size
      }
    })
    return size
  }
}

var instDirectory = new Directory()
module.exports = instDirectory
