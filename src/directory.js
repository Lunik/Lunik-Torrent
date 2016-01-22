var Log = require('./log.js')

var fs = require('fs')

function Directory () {
  this.config = require('./config.json')
  this.path = this.config.directory.path
}

Directory.prototype.list = function (dir) {
  var files = fs.readdirSync(this.path + dir)
  var list = {}
  var totalSize = 0
  if (files.length > 0) {
    files.forEach(function (file) {
      var stats = fs.statSync(instDirectory.path + dir + file)
      if (stats.isFile()) {
        list[file] = stats
      } else {
        stats.size = sizeRecursif(instDirectory.path + dir + file)
        list[file] = stats
      }
      list[file].isfile = stats.isFile()
      list[file].isdir = stats.isDirectory()

      totalSize += stats.size

    })
    return {
      'totalSize': totalSize,
      'files': list
    }
  } else {
    return {}
  }
}

Directory.prototype.remove = function (file) {
  Log.print('Remove file: ' + file)
  fs.stat(this.path + file, function(err, stats){
    if(err) Log.print(err)
    if (stats.isDirectory()) {
      removeRecursif(instDirectory.path + file)
    } else {
      fs.unlink(instDirectory.path + file, function(err){
        if(err) Log.print(err)
      })
    }
  })

}

Directory.prototype.rename = function (path, oldname, newname) {
  Log.print('Rename: ' + oldname + ' In: ' + newname)
  fs.rename(this.path + path + '/' + oldname, this.path + path + '/' + newname, function(err){
    if(err) Log.print(err)
  })
}

Directory.prototype.mkdir = function (path, name) {
  Log.print('Mkdir: ' + path + '/' + name)
  fs.mkdir(this.path + path + '/' + name, function(err){
    if(err) Log.print(err)
  })
}

Directory.prototype.mv = function (path, file, folder) {
  Log.print('Move: ' + file + ' into ' + path + folder)
  fs.rename(this.path + path + file, this.path + path + folder + '/' + file, function(err){
    if(err) Log.print(err)
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
