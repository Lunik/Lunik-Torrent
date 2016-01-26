var Log = require('./log.js')

var fs = require('fs')

function Directory() {
  this.config = require('./config.json')
  this.path = this.config.directory.path

  this.dir = {}
}

Directory.prototype.list = function(dir) {

  if (this.dir[dir] == null) {
    this.dir[dir] = this.getDir(dir)
  } else  {
    if (this.dir[dir].mtime < fs.statSync(instDirectory.path + dir).mtime) {
      this.dir[dir] = this.getDir(dir)
    }
  }

  return {
    'totalSize': this.dir[dir].totalSize,
    'files': this.dir[dir].files
  }
}

Directory.prototype.getDir = function(dir) {
  var list = {}
  var totalSize = 0
  var files = fs.readdirSync(this.path + dir)

  if (files.length > 0) {
    files.forEach(function(file) {
      var stats = instDirectory.getInfo(instDirectory.path + dir + file)
      list[file] = stats

      totalSize += stats.size
    })
  }

  return {
    'mtime': fs.statSync(instDirectory.path + dir).mtime,
    'totalSize': totalSize,
    'files': list
  }
}

Directory.prototype.getInfo = function(file){
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

Directory.prototype.remove = function(file) {
  fs.stat(this.path + file, function(err, stats) {
    if (err) Log.print(err)
    if (stats.isDirectory()) {
      removeRecursif(instDirectory.path + file)
    } else {
      fs.unlink(instDirectory.path + file, function(err) {
        if (err) Log.print(err)
      })
    }
  })

}

Directory.prototype.rename = function(path, oldname, newname) {
  fs.rename(this.path + path + '/' + oldname, this.path + path + '/' + newname, function(err) {
    if (err) Log.print(err)
  })
}

Directory.prototype.mkdir = function(path, name) {
  fs.mkdir(this.path + path + '/' + name, function(err) {
    if (err) Log.print(err)
  })
}

Directory.prototype.mv = function(path, file, folder) {
  fs.rename(this.path + path + file, this.path + path + folder + '/' + file, function(err) {
    if (err) Log.print(err)
  })
}


function removeRecursif(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
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

function sizeRecursif(path) {
  var size = 0
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
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
