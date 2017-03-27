'use strict'

var fs = require('fs-extra')
var klaw = require('klaw')
var Path = require('path')
var Database = require(Path.join(__workingDir, 'database/client.js'))
var DB = {
  directory: new Database('directory', __config.database.host, __config.database.port, __DBtoken)
}

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Directory'
})
/**
 * Directory manager.
 * @constructor
 */
class Directory {
  constructor () {
    DB.directory.update({}, {
      $set: {
        downloading: 0
      }
    }, {}, (err) => {
      if (err) {
        LogWorker.error(err)
      }
    })
  }

/**
 * Get the list and informations of files into a specific directory.
 * @param {string} dir - Directory to scan.
 * @return {object} - Directory informations.
*/
  list (dir, cb) {
    var response = {
      'totalSize': 0,
      'files': {}
    }
    var list = () => {
      try {
        klaw(Path.join(__config.directory.path, dir))
        .on('data', (child) => {
          var reChild = child.path.split(Path.join(__config.directory.path, dir))

          if (reChild.length >= 2 && reChild[reChild.length - 1].indexOf('/') === -1) {
            var name = child.path.split('/')
            if (name[name.length - 1] === '' && name.length > 2) name.pop()
            name = name[name.length - 1]
            child.stats.isfile = fs.lstatSync(child.path).isFile()
            child.stats.isdir = fs.lstatSync(child.path).isDirectory()
            response.files[name] = child.stats
          }

          response.totalSize += child.stats.size
        })
        .on('end', () => {
          var parent = dir.split('/')
          if (parent[parent.length - 1] === '' && parent.length > 1) parent.pop()
          parent = parent[parent.length - 1]

          DB.directory.find({
            parent: parent
          }, (err, files) => {
            if (err) {
              LogWorker.error(err)
              cb(false)
            } else {
              DB.directory.find({
                name: parent
              }, (err, parents) => {
                if (err) {
                  LogWorker.error(err)
                }
                for (var f in response.files) {
                  var find = files.find((e) => { return e.name === f && e.parent === parent })
                  if (find == null) {
                    DB.directory.insert({
                      parent: parent,
                      name: f,
                      download: 0,
                      downloading: 0,
                      owner: parents[0] ? parents[0].owner : ''
                    })
                    response.files[f].download = 0
                    response.files[f].downloading = 0
                    response.files[f].owner = parents[0] ? parents[0].owner : ''
                  } else {
                    response.files[f].download = find.download
                    response.files[f].downloading = find.downloading
                    response.files[f].owner = find.owner
                  }
                }
                cb(response)
              })
            }
          })
        })
      } catch (e) {
        LogWorker.error(e)
      }
    }

    setTimeout(list)
  }

/**
 * Lock a file.
 * @param {string} file - File to lock.
*/
  setDownloading (file, cb) {
    var setDownloading = () => {
      file = file.split('/')
      if (file[file.length - 1] === '' && parent.length > 2) file.pop()
      var name = file[file.length - 1]
      var parent = file[file.length - 2] || ''

      DB.directory.update({
        name: name,
        parent: parent
      }, {
        $inc: {
          download: 1,
          downloading: 1
        }
      }, {}, (err) => {
        if (err) {
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
  finishDownloading (file, cb) {
    var finishDownloading = () => {
      file = file.split('/')
      if (file[file.length - 1] === '' && parent.length > 2) file.pop()
      var name = file[file.length - 1]
      var parent = file[file.length - 2]

      DB.directory.update({
        name: name,
        parent: parent
      }, {
        $inc: {
          downloading: -1
        }
      }, {}, (err) => {
        if (err) {
          LogWorker.error(err)
          cb(true)
        } else {
          cb(false)
        }
      })

      DB.directory.update({
        name: name,
        parent: parent
      }, {
        $max: {
          downloading: 0
        }
      }, {}, (err) => {
        if (err) {
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
  isDownloading (file, cb) {
    var isDownloading = () => {
      file = file.split('/')
      if (file[file.length - 1] === '' && file.length > 2) file.pop()
      var name = file[file.length - 1]
      var parent = file[file.length - 2] || ''

      DB.directory.find({
        $or: [{
          name: name,
          parent: parent
        }, {
          parent: name
        }]
      }, (err, files) => {
        if (err) {
          LogWorker.error(err)
          cb(false)
        } else {
          if (files.length <= 0) {
            cb(false)
          } else {
            var isdl = false
            for (var f in files) {
              if (files[f].downloading > 0) {
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
  remove (file, cb) {
    var remove = () => {
      this.isDownloading(file, (isDownloading) => {
        if (isDownloading) {
          cb(true)
        } else {
          fs.remove(Path.join(__config.directory.path, file), (err) => {
            if (err) {
              LogWorker.error(err)
              cb(true)
            } else {
              file = file.split('/')
              if (file[file.length - 1] === '' && file.length > 2) file.pop()
              var name = file[file.length - 1]
              var parent = file[file.length - 2]

              DB.directory.remove({
                $or: [{
                  name: name,
                  parent: parent
                }, {
                  parent: name
                }]
              }, { multi: true }, (err) => {
                if (err) {
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
  rename (path, oldname, newname, cb) {
    var rename = () => {
      this.isDownloading(Path.join(path, oldname), (isDownloading) => {
        if (isDownloading) {
          cb(true)
        } else {
          fs.rename(Path.join(__config.directory.path, path, oldname), Path.join(__config.directory.path, path, newname), (err) => {
            if (err) {
              LogWorker.error(err)
              cb(true)
              return
            } else {
              var parent = path.split('/')
              if (parent[parent.length - 1] === '' && parent.length > 2) parent.pop()
              parent = parent[parent.length - 1]

              DB.directory.update({
                name: oldname,
                parent: parent
              }, {
                $set: {
                  name: newname
                }
              }, {}, (err) => {
                if (err) {
                  LogWorker.error(err)
                  cb(true)
                } else {
                  DB.directory.update({
                    parent: oldname
                  }, {
                    $set: {
                      parent: newname
                    }
                  }, {}, (err) => {
                    if (err) {
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
  mkdir (path, name, user) {
    var mkdir = () => {
      fs.mkdir(Path.join(__config.directory.path, path, name), (err) => {
        if (err) {
          LogWorker.error(err)
        } else {
          var parent = path.split('/')
          if (parent[parent.length - 1] === '' && parent.length > 2) parent.pop()
          parent = parent[parent.length - 1]

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
  mv (path, file, folder, cb) {
    var mv = () => {
      this.isDownloading(Path.join(path, file), (isDownloading) => {
        if (isDownloading) {
          cb(true)
        } else {
          fs.rename(Path.join(__config.directory.path, path, file), Path.join(__config.directory.path, path, folder, file), (err) => {
            if (err) {
              LogWorker.error(err)
              cb(true)
              return
            } else {
              var parent = path.split('/')
              if (parent[parent.length - 1] === '' && parent.length > 1) {
                parent.pop()
                parent.pop()
              }
              var gp = parent[parent.length - 2] || ''
              parent = parent[parent.length - 1]

              DB.directory.update({
                name: file,
                parent: parent
              }, {
                $set: {
                  parent: folder === '..'
                  ? parent.length > 1
                    ? gp
                    : ''
                  : folder
                }
              }, {}, (err) => {
                if (err) {
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
  setOwner (file, user) {
    var setOwner = () => {
      file = file.split('/')
      var name = file[file.length - 1]
      var parent = file[file.length - 2] || ''
      if (file[file.length - 1] === '' && parent.length > 2) file.pop()

      DB.directory.update({
        name: name,
        parent: parent
      }, {
        $set: {
          owner: user
        }
      }, {}, (err) => {
        if (err) {
          LogWorker.error(err)
        }
      })
    }
    setTimeout(setOwner)
  }
}
module.exports = new Directory()
