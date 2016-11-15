'use strict'

var fs = require('fs')
var Path = require('path')

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Directory'
})
/**
 * Directory manager.
 * @constructor
 */
function Directory () {
  var self = this
  this.fileInfo = {}
  this.loadFileInfo()

  setInterval(function () {
    self.updateDownloads()
  }, 30000)
}

/**
 * Get the list and informations of files into a specific directory.
 * @param {string} dir - Directory to scan.
 * @return {object} - Directory informations.
*/
Directory.prototype.list = function (dir, cb) {
  var self = this
  var list = function () {
    // save directory informations into app cache
    self.getDir(dir, function (folder) {
      for (var f in folder.files) {
        var file = Path.join(dir, f)
        file = file[0] === '/' ? file.substring(1) : file
        if (self.fileInfo[file] !== -1) {
          for (var i in self.fileInfo[file]) {
            folder.files[f][i] = self.fileInfo[file][i]
          }
        }
      }
      cb({
        'totalSize': folder.totalSize,
        'files': folder.files
      })
    })
  }

  setTimeout(list)
}

/**
 * Get directory informations.
 * @param {string} dir - Directory to get informations.
 * @return {object} - Directory informations.
*/
Directory.prototype.getDir = function (dir, cb) {
  var self = this

  var getDir = function () {
    var list = {}
    var totalSize = 0
    var files = fs.readdir(Path.join(__config.directory.path, dir), function (err, files) {
      if (err) {
        cb({
          'mtime': 0,
          'totalSize': 0,
          'files': []
        })
        LogWorker.error(err)
        return
      }
      if (files && files.length > 0) {
        var length = files.length
        var i = 0
        files.forEach(function (file) {
          self.getInfo(Path.join(__config.directory.path, dir, file), function (stats) {
            list[file] = stats
            totalSize += stats.size

            i++
            if (i === length) {
              fs.stat(Path.join(__config.directory.path, dir), function (err, s) {
                if (err) {
                  LogWorker.error(err)
                  cb({
                    'mtime': 0,
                    'totalSize': 0,
                    'files': []
                  })
                  return
                }
                cb({
                  'mtime': s.mtime,
                  'totalSize': totalSize,
                  'files': list
                })
              })
            }
          })
        })
      } else {
        fs.stat(Path.join(__config.directory.path, dir), function (err, s) {
          if (err) {
            LogWorker.error(err)
            cb({
              'mtime': 0,
              'totalSize': 0,
              'files': []
            })
            return
          }
          cb({
            'mtime': s.mtime,
            'totalSize': totalSize,
            'files': list
          })
        })
      }
    })
  }
  setTimeout(getDir)
}

/**
 * Get file informations.
 * @param {string} file - File / Directory to get informations.
 * @return {object} - File / Directory informations.
*/
Directory.prototype.getInfo = function (file, cb) {
  var getInfo = function () {
    fs.stat(file, function (err, stats) {
      if (err) {
        cb({})
        LogWorker.error(err)
        return
      }
      var sfile = {}
      // get size if it's a Directory
      if (stats.isFile()) {
        sfile = stats
      } else {
        stats.size = sizeRecursif(file)
        sfile = stats
      }
      sfile.isfile = stats.isFile()
      sfile.isdir = stats.isDirectory()
      cb(sfile)
    })
  }

  setTimeout(getInfo)
}

/**
 * Lock a file.
 * @param {string} file - File to lock.
*/
Directory.prototype.setDownloading = function (file) {
  var self = this
  var setDownloading = function () {
    // file info default value
    self.fileInfo[file] = self.fileInfo[file] || {}
    // increment file download
    self.fileInfo[file].download = self.fileInfo[file].download + 1 || 1
    // increment file current downloading and set the current date
    self.fileInfo[file].downloading = self.fileInfo[file].downloading
      ? {date: new Date(), count: self.fileInfo[file].downloading.count + 1}
      : {date: new Date(), count: 1}

    self.saveFileInfo()
  }
  setTimeout(setDownloading)
}

/**
 * Unlock a file.
 * @param {string} file - File to unlock.
*/
Directory.prototype.finishDownloading = function (file) {
  var self = this
  var finishDownloading = function () {
    // decrement file downloading
    self.fileInfo[file].downloading = self.fileInfo[file].downloading
      ? {date: self.fileInfo[file].downloading.date, count: self.fileInfo[file].downloading.count - 1}
      : {date: new Date(), count: 0}

    if (self.fileInfo[file].downloading.count >= 0) {
      delete self.fileInfo[file].downloading
    }
  }

  setTimeout(finishDownloading)
}

/**
 * Auto Unlock a files after 1h.
*/
Directory.prototype.updateDownloads = function () {
  var self = this
  var updateDownloads = function () {
    var curDate = new Date()
    for (var key in self.fileInfo) {
      if (self.fileInfo[key] && self.fileInfo[key].downloading) {
        // if downloading for more than 1 hour remove
        if (curDate - self.fileInfo[key].downloading.date > 3600000) {
          delete self.fileInfo[key].downloading
        }
      }
    }
  }
  setTimeout(updateDownloads)
}

/**
 * Check if a file is locked.
 * @param {string} file - File to check.
 * @return {bool} - File lock state.
*/
Directory.prototype.isDownloading = function (file) {
  file = file[0] === '/' ? file.substring(1) : file
  return this.fileInfo[file] && this.fileInfo[file].downloading ? true : false
}

/**
 * Remove a file.
 * @param {string} file - File to remove.
*/
Directory.prototype.remove = function (file, cb) {
  var self = this
  var remove = function () {
    if (self.isDownloading(file)) {
      cb(-1)
      return
    }
    fs.stat(Path.join(__base, __config.directory.path, file), function (err, stats) {
      if (err) {
        LogWorker.error(err)
        cb(-1)
        return
      }
      if (stats) {
        if (stats.isDirectory()) {
          removeRecursif(Path.join(__base, __config.directory.path, file))
          cb()
          return
        } else {
          fs.unlink(Path.join(__base, __config.directory.path, file), function (err) {
            if (err) {
              LogWorker.error(err)
              cb(-1)
              return
            } else {
              cb()
              return
            }
          })
        }
      }
    })
  }

  setTimeout(remove)
}

/**
 * Raname a file.
 * @param {string} path - File directory path.
 * @param {string} oldname - File old name.
 * @param {string} newname - File new name.
*/
Directory.prototype.rename = function (path, oldname, newname, cb) {
  var self = this

  var rename = function () {
    if (self.isDownloading(Path.join(path, oldname))) {
      cb(-1)
      return
    }
    fs.rename(Path.join(__base, __config.directory.path, path, oldname), Path.join(__base, __config.directory.path, path, newname), function (err) {
      if (err) {
        LogWorker.error(err)
        cb(-1)
        return
      }
      // If dir modify also all file in this dir

      var oldfile = Path.join(path, oldname)
      oldfile = oldfile[0] === '/' ? oldfile.substring(1) : oldfile

      var newfile = Path.join(path, newname)
      newfile = newfile[0] === '/' ? newfile.substring(1) : newfile

      self.fileInfo[newfile] = self.fileInfo[oldfile]
      delete self.fileInfo[oldfile]

      self.saveFileInfo()

      cb()
      return
    })
  }

  setTimeout(rename)
}

/**
 * Create directory.
 * @param {string} path - Parent directory path.
 * @param {string} name - Directory name.
*/
Directory.prototype.mkdir = function (path, name) {
  var mkdir = function () {
    fs.mkdir(Path.join(__base, __config.directory.path, path, name), function (err) {
      if (err) {
        LogWorker.error(err)
        return
      }
    })
  }
  setTimeout(mkdir)
}

/**
 * Move a file or directory.
 * @param {string} path - File / Directory directory path.
 * @param {string} file - File / Directory name.
 * @param {string} folder - Destination directory.
*/
Directory.prototype.mv = function (path, file, folder, cb) {
  var self = this
  var mv = function () {
    if (self.isDownloading(Path.join(path, file))) {
      cb(-1)
      return
    }
    fs.rename(Path.join(__base, __config.directory.path, path, file), Path.join(__base, __config.directory.path, path, folder, file), function (err) {
      if (err) {
        LogWorker.error(err)
        cb(-1)
        return
      } else {
        cb()
      }
      // If dir modify also all file in this dir

      var oldfile = Path.join(path, file)
      oldfile = oldfile[0] === '/' ? oldfile.substring(1) : oldfile

      var newfile = Path.join(path, folder, file)
      newfile = newfile[0] === '/' ? newfile.substring(1) : newfile

      self.fileInfo[newfile] = self.fileInfo[oldfile]
      delete self.fileInfo[oldfile]

      self.saveFileInfo()

      cb()
      return
    })
  }
  setTimeout(mv)
}

/**
 * Set the File / Directory Owner.
 * @param {string} file - File / Directory name.
 * @param {string} user - Owner.
*/
Directory.prototype.setOwner = function (file, user) {
  var self = this

  var setOwner = function () {
    file = file[0] === '/' ? file.slice(1) : file
    // set owner defalt value
    self.fileInfo[file] = self.fileInfo[file] || {}
    // prevent override current user
    if (self.fileInfo[file].owner == null) {
      self.fileInfo[file].owner = user
    }
    self.saveFileInfo()
  }
  setTimeout(setOwner)
}

/**
 * Load data/fileInfo.json into Directory.fileInfo.
*/
Directory.prototype.loadFileInfo = function () {
  var self = this

  var loadFileInfo = function () {
    var fileInfo
    try {
      fileInfo = require(Path.join(__base, 'data/fileInfo.json'))
    } catch (e) {
      fileInfo = {}
      self.saveFileInfo()
    } finally {
      for (var key in fileInfo) {
        delete fileInfo[key].downloading
      }
      self.fileInfo = fileInfo
    }
  }

  setTimeout(loadFileInfo)
}

/**
 * Save Directory.fileInfo into data/fileInfo.json.
*/
Directory.prototype.saveFileInfo = function () {
  var self = this

  var saveFileInfo = function () {
    if (!self.saving) {
      self.saving = true
      fs.writeFile(Path.join(__base, 'data/fileInfo.json'), JSON.stringify(self.fileInfo), function (err) {
        self.saving = false
        if (err) {
          LogWorker.error(err)
          return
        }
      })
    }
  }

  setTimeout(saveFileInfo)
}

/**
 * Remove Directory recursively.
 * @param {string} path - Directory to remove.
*/
function removeRecursif (path) {
  var removeRecursif = function () {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, index) {
        var curPath = Path.join(path, file)
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          removeRecursif(curPath)
        } else { // delete file
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(path)
    }
  }

  setTimeout(removeRecursif)
}

/**
 * Get the Directory size recursively.
 * @param {string} path - Directory to remove.
 * @return {int} - Directory size (bytes)
*/
function sizeRecursif (path) {
  var size = 0
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = Path.join(path, file)
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        size += sizeRecursif(curPath)
      } else { // read size
        size += fs.statSync(curPath).size
      }
    })
    return size
  }
}

module.exports = new Directory()
