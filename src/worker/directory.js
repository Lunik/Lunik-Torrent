'use strict'

var fs = require('fs-extra')
var Path = require('path')
var Datastore = require('nedb')

var DB = {
  directory: new Datastore({ filename: Path.join(__base, 'data/directory.db') }),
}

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

  DB.directory.loadDatabase()
  DB.directory.update({}, {
    $set: {
      downloading: 0
    }
  }, {}, function(err){
    if(err){
      LogWorker.error(err)
    }
  })
}

/**
 * Get the list and informations of files into a specific directory.
 * @param {string} dir - Directory to scan.
 * @return {object} - Directory informations.
*/
Directory.prototype.list = function (dir, cb) {
  var self = this
  var response = {
    'totalSize': 0,
    'files': {}
  }
  var list = function () {
    var childrens = []
    fs.walk(Path.join(__config.directory.path, dir))
      .on('data', function(child){
        var reChild = new RegExp(Path.join(__config.directory.path, dir)+'[^\/]*$', 'g')

        if(child.path.match(reChild)){
          var name = child.path.split('/')
          if(name[name.length-1] === '' && parent.length > 2) name.pop()
          name = name[name.length - 1]
          child.stats.isfile = fs.lstatSync(child.path).isFile()
          child.stats.isdir = fs.lstatSync(child.path).isDirectory()
          response.files[name] = child.stats
        }

        response.totalSize += child.stats.size
      })
      .on('end', function(){
        var parent = dir.split('/')
        if(parent[parent.length-1] === '' && parent.length > 2) parent.pop()
        parent = parent[parent.length - 1]

        DB.directory.loadDatabase()
        DB.directory.find({
          parent: parent
        }, function(err, files){
          if(err){
            LogWorker.error(err)
            cb(false)
          } else {
            for(var f in response.files){
              if(!files.find(function(e){ return e.name == f && e.parent == parent })){
                DB.directory.insert({
                  parent: parent,
                  name: f,
                  download: 0,
                  downloading: 0,
                  owner: null
                })
              }
            }
          }
        })
        cb(response)
      })
  }

  setTimeout(list)
}

/**
 * Lock a file.
 * @param {string} file - File to lock.
*/
Directory.prototype.setDownloading = function (file, cb) {
  var self = this
  var setDownloading = function () {
    file = file.split('/')
    if(file[file.length-1] === '' && parent.length > 2) file.pop()
    var name = file[file.length - 1]
    var parent = file[file.length - 2] || ""

    DB.directory.loadDatabase()
    DB.directory.update({
      name: name,
      parent: parent
    }, {
      $inc: {
        download: 1,
        downloading: 1
      }
    }, {}, function(err){
      if(err){
        LogWorker.error(err)
        cb(true)
      } else {
        cb(false)
      }
    })
  }
  setTimeout(setDownloading)
}

/**
 * Unlock a file.
 * @param {string} file - File to unlock.
*/
Directory.prototype.finishDownloading = function (file, cb) {
  var self = this
  var finishDownloading = function () {
    file = file.split('/')
    if(file[file.length-1] === '' && parent.length > 2) file.pop()
    var name = file[file.length - 1]
    var parent = file[file.length - 2]

    DB.directory.loadDatabase()
    DB.directory.update({
      name: name,
      parent: parent
    }, {
      $inc: {
        downloading: -1
      }
    }, {}, function(err){
      if(err){
        LogWorker.error(err)
        cb(true)
      } else {
        cb(false)
      }
    })
    DB.directory.loadDatabase()
    DB.directory.update({
      name: name,
      parent: parent
    }, {
      $max: {
        downloading: 0
      }
    }, {}, function(err){
      if(err){
        LogWorker.error(err)
        cb(false)
      }
    })
  }

  setTimeout(finishDownloading)
}

/**
 * Check if a file is locked.
 * @param {string} file - File to check.
 * @return {bool} - File lock state.
*/
Directory.prototype.isDownloading = function (file, cb) {
  var isDownloading = function(){
    file = file.split('/')
    if(file[file.length-1] === '' && file.length > 2) file.pop()
    var name = file[file.length - 1]
    var parent = file[file.length - 2] || ""

    DB.directory.loadDatabase()
    DB.directory.find({
      $or: [{
          name: name,
          parent: parent
      }, {
        parent: name
      }]
    }, function(err, files){
      if(err){
        LogWorker.error(err)
        cb(false)
      } else {
        if(files.length <= 0){
          cb(false)
        } else {
          var isdl = false
          for(var f in files){
            if(files[f].downloading > 0){
              isdl = true || isdl
            }
          }
          cb(isdl)
        }
      }
    })
  }

  setTimeout(isDownloading)
}

/**
 * Remove a file.
 * @param {string} file - File to remove.
*/
Directory.prototype.remove = function (file, cb) {
  var self = this
  var remove = function () {
    self.isDownloading(file, function(isDownloading){
      if(isDownloading){
        cb(true)
      } else {
        fs.remove(Path.join(__config.directory.path, file), function(err){
          if(err){
            LogWorker.error(err)
            cb(true)
          } else {
            file = file.split('/')
            if(file[file.length-1] === '' && file.length > 2) file.pop()
            var name = file[file.length - 1]
            var parent = file[file.length - 2]

            DB.directory.loadDatabase()
            DB.directory.remove({
              $or: [{
                  name: name,
                  parent: parent
              }, {
                parent: name
              }]
            }, { multi: true }, function(err){
              if(err){
                LogWorker.error(err)
                cb(true)
              } else {
                cb(false)
              }
            })
          }
        })
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
    self.isDownloading(Path.join(path, oldname), function(isDownloading){
      if(isDownloading){
        cb(true)
      } else {
        fs.rename(Path.join(__config.directory.path, path, oldname), Path.join(__config.directory.path, path, newname), function (err) {
          if (err) {
            LogWorker.error(err)
            cb(true)
            return
          } else {
            var parent = path.split('/')
            if(parent[parent.length-1] === '' && parent.length > 2) parent.pop()
            parent = parent[parent.length - 1]

            DB.directory.loadDatabase()
            DB.directory.update({
              name: oldname,
              parent: parent
            }, {
              $set: {
                name: newname
              }
            }, {}, function(err){
              if(err){
                LogWorker.error(err)
                cb(true)
              } else {
                DB.directory.loadDatabase()
                DB.directory.update({
                  parent: oldname
                }, {
                  $set: {
                    parent: newname
                  }
                }, {}, function(err){
                  if(err){
                    LogWorker.error(err)
                    cb(true)
                  } else {
                    cb(false)
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  setTimeout(rename)
}

/**
 * Create directory.
 * @param {string} path - Parent directory path.
 * @param {string} name - Directory name.
*/
Directory.prototype.mkdir = function (path, name, user) {
  var mkdir = function () {
    fs.mkdir(Path.join(__config.directory.path, path, name), function (err) {
      if (err) {
        LogWorker.error(err)
      } else {
        var parent = path.split('/')
        if(parent[parent.length-1] === '' && parent.length > 2) parent.pop()
        parent = parent[parent.length - 1]

        DB.directory.loadDatabase()
        DB.directory.insert({
          parent: parent,
          name: name,
          download: 0,
          downloading: 0,
          owner: user
        })
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
    self.isDownloading(Path.join(path, file), function(isDownloading){
      if(isDownloading){
        cb(true)
      } else {
        fs.rename(Path.join(__config.directory.path, path, file), Path.join(__config.directory.path, path, folder, file), function (err) {
          if (err) {
            LogWorker.error(err)
            cb(true)
            return
          } else {
            var parent = path.split('/')
            if(parent[parent.length-1] === '' && parent.length > 2) parent.pop()
            parent = parent[parent.length - 1]

            DB.directory.loadDatabase()
            DB.directory.update({
              name: file,
              parent: parent
            }, {
              $set: {
                parent: folder == ".."
                  ? parent.length > 1
                    ? parent[parent.length - 2]
                    : ""
                  : folder

              }
            }, {}, function(err){
              if(err){
                LogWorker.error(err)
                cb(true)
              } else {
                cb(false)
              }
            })
          }
        })
      }
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
    file = file.split('/')
    if(file[file.length-1] === '' && parent.length > 2) file.pop()
    var name = file[file.length - 1]
    var parent = file[file.length - 2]

    DB.directory.loadDatabase()
    DB.directory.update({
      name: name,
      parent: parent
    }, {
      $set: {
        owner: user
      }
    }, {}, function(err){
      if(err){
        LogWorker.error(err)
      }
    })
  }
  setTimeout(setOwner)
}

module.exports = new Directory()
