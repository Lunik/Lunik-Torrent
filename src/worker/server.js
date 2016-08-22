'use strict'

var express = require('express')
var compression = require('compression')
var http = require('http')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var Path = require('path')

http.globalAgent.maxSockets = Infinity

var Log = require(Path.join(__base, 'src/worker/log.js'))
var Torrent = require(Path.join(__base, 'src/worker/torrent.js'))
var Directory = require(Path.join(__base, 'src/worker/directory.js'))
var FileTransfert = require(Path.join(__base, 'src/worker/filetransfert.js'))
var Auth = require(Path.join(__base, 'src/worker/auth.js'))

Torrent.Directory = Directory

/**
 * Deserve http requests.
 * @constructor
*/
function Server () {
  this.app = express()
  this.app.use(compression())
  this.app.use(cookieParser())
  this.app.use(bodyParser.json())
  this.app.use(bodyParser.urlencoded({
    extended: true
  }))
  this.app.use(function (req, res, next) {
    if (req.url === '/login.html' || req.url.match(/\/auth\?todo=.*/g) || req.url.match(/\/src\/.*/g)) {
      if (req.url === '/login.html' && req.cookies){
        Auth.checkLogged(req.cookies.user, req.cookies.token, function(logged){
          if(logged){
            res.redirect('/')
          } else {
            next()
          }
        })
      } else {
        next()
      }
    } else {
      if(req.cookies){
        Auth.checkLogged(req.cookies.user, req.cookies.token, function(logged){
          if(logged){
            next()
          } else {
            res.redirect('/login.html')
          }
        })
      } else {
        res.redirect('/login.html')
      }
    }
  })
  this.app.use(express.static(Path.join(__base, 'src/public')))

  this.server = http.createServer(this.app)
  var port = process.env.PORT || __config.server.port
  this.server.listen(port, function () {
    Log.print('Server listening at port ' + port)
  })

  // Client Download file
  this.app.get('/files', function (req, res) {
    if (req.query.f) {
      req.query.f = req.query.f.split('..').join('')
      Log.print(req.cookies.user + ' download file: ' + req.query.f)
      Directory.setDownloading(req.query.f)
      var transfert = new FileTransfert(req, res, function () {
        Directory.finishDownloading(req.query.f)
      })
    } else {
      res.end(JSON.stringify({
        err: "File doesn't exist."
      }))
    }
  })

  // client start torrent
  this.app.post('/download-t', function (req, res) {
    if (req.body.url) {
      Log.print(req.cookies.user + ' download torrent: ' + req.body.url)
      Torrent.setDownloader(req.cookies.user, req.body.url)
      Torrent.start(req.body.url)
      res.end(JSON.stringify({}))
    } else {
      res.end(JSON.stringify({
        err: 'Wrong url.'
      }))
    }
  })

  // client ask list of torrent active
  this.app.post('/list-t', function (req, res) {
    res.end(JSON.stringify(Torrent.getInfo()))
  })

  // client ask list of directory
  this.app.post('/list-d', function (req, res) {
    if (req.body.dir) {
      req.body.dir = req.body.dir.replace(/%20/g, ' ')
      res.end(JSON.stringify(Directory.list(req.body.dir)))
    } else {
      res.end(JSON.stringify({
        err: 'Undefined directory.'
      }))
    }
  })

  // client remove torrent
  this.app.post('/remove-t', function (req, res) {
    if (req.body.hash) {
      Log.print(req.cookies.user + ' remove torrent: ' + req.body.hash)
      Torrent.remove(req.body.hash)
      res.end(JSON.stringify({
        hash: req.body.hash
      }))
    } else {
      res.end(JSON.stringify({
        err: 'Wrong hash.'
      }))
    }
  })

  // client remove directory / file
  this.app.post('/remove-d', function (req, res) {
    if (req.body.file) {
      req.body.file = req.body.file.replace(/%20/g, ' ')
      if (Directory.remove(req.body.file) !== -1) {
        Log.print(req.cookies.user + ' remove file: ' + req.body.file)
        res.end(JSON.stringify({
          file: req.body.file.split('/')[req.body.file.split('/').length - 1]
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Cannot remove, someone is downloading the file.'
        }))
      }
    } else {
      res.end(JSON.stringify({
        err: 'Wrong file.'
      }))
    }
  })

  // client rename file
  this.app.post('/rename-d', function (req, res) {
    if (req.body.path && req.body.oldname && req.body.newname) {
      req.body.path = req.body.path.replace(/%20/g, ' ')
      req.body.oldname = req.body.oldname.replace(/%20/g, ' ')
      req.body.newname = req.body.newname.replace(/%20/g, ' ')
      if (Directory.rename(req.body.path, req.body.oldname, req.body.newname) !== -1) {
        Log.print(req.cookies.user + ' rename file: ' + Path.join(req.body.path, req.body.oldname) + ' in: ' + req.body.newname)
        res.end(JSON.stringify({
          path: req.body.path,
          oldname: req.body.oldname,
          newname: req.body.newname
        }))
        Directory.setOwner(Path.join(req.body.path, req.body.newname), req.cookies.user)
      } else {
        res.end(JSON.stringify({
          err: 'Cannot rename, someone is downloading the file.'
        }))
      }
    } else {
      res.end(JSON.stringify({
        err: 'Wrong name.'
      }))
    }
  })

  // client create directory
  this.app.post('/mkdir-d', function (req, res) {
    if (req.body.path && req.body.name) {
      req.body.path = req.body.path.replace(/%20/g, ' ')
      req.body.name = req.body.name.replace(/%20/g, ' ')
      Log.print(req.cookies.user + ' create directory: ' + Path.join(req.body.path, req.body.name))
      Directory.mkdir(req.body.path, req.body.name)
      res.end(JSON.stringify({
        name: req.body.name
      }))
      Directory.setOwner(Path.join(req.body.path, req.body.name), req.cookies.user)
    } else {
      res.end(JSON.stringify({
        err: 'Wrong name.'
      }))
    }
  })

  // client move directory
  this.app.post('/mv-d', function (req, res) {
    if (req.body.path && req.body.file && req.body.folder) {
      req.body.path = req.body.path.replace(/%20/g, ' ')
      req.body.file = req.body.file.replace(/%20/g, ' ')
      req.body.folder = req.body.folder.replace(/%20/g, ' ')
      if (Directory.mv(req.body.path, req.body.file, req.body.folder) !== -1) {
        Log.print(req.cookies.user + ' move: ' + Path.join(req.body.path, req.body.file) + ' in: ' + Path.join(req.body.path, req.body.folder))
        res.end(JSON.stringify({
          file: req.body.file
        }))
        Directory.setOwner(Path.join(req.body.path, req.body.folder, req.body.file), req.cookies.user)
      } else {
        res.end(JSON.stringify({
          err: 'Cannot move, someone is downloading the file.'
        }))
      }
    } else {
      res.end(JSON.stringify({
        err: 'Wrong name.'
      }))
    }
  })

  // client search torrent
  this.app.post('/search-t', function (req, res) {
    var searchEngine = require('./searchT.js')
    if (req.body.query !== '') {
      req.body.query = req.body.query.replace(/%20/g, ' ')
      Log.print(req.cookies.user + ' search: ' + req.body.query)
      searchEngine.search(req.body.query, function (data) {
        res.end(JSON.stringify(data))
      })
    } else {
      searchEngine.latest(function (data) {
        res.end(JSON.stringify(data))
      })
    }
  })

  // client get meida info
  this.app.post('/info-d', function (req, res) {
    if (req.body.type && req.body.query) {
      req.body.type = req.body.type.replace(/%20/g, ' ')
      req.body.query = req.body.query.replace(/%20/g, ' ')
      var infoEngine = require('./mediaInfo.js')
      infoEngine.getInfo(req.body.type, req.body.query, function (data) {
        res.end(JSON.stringify(data))
      })
    } else {
      res.end(JSON.stringify({
        err: 'Type or query not set.'
      }))
    }
  })

  // lock api request
  this.app.get('/lock-d', function (req, res) {
    if (req.query.f) {
      req.query.f = req.query.f.replace(/%20/g, ' ')
      res.end(Directory.isDownloading(req.query.f).toString())
    } else {
      res.end(JSON.stringify({
        err: 'File not set.'
      }))
    }
  })

  this.app.post('/auth', function (req, res) {
    var reponse = {}
    if (req.query.todo) {
      var data = {
        user: req.body.user || req.cookies.user,
        pass: req.body.pass,
        token: req.body.token || req.cookies.token,
        invite: req.body.invite,
        invitationKey: req.body.invitationkey
      }
      switch (req.query.todo) {
        case 'login':
          if (data.user && data.pass) {
            Auth.login(data.user, data.pass, function(token){
              if (token) {
                res.cookie('token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
                res.cookie('user', data.user, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
                res.end(JSON.stringify({
                  err: false,
                  token: token
                }))
              } else {
                res.end(JSON.stringify({
                  err: 'Wrong User or Pass.'
                }))
              }
            })
          } else {
            res.end(JSON.stringify({
              err: 'Missing User or Pass.'
            }))
          }
          break

        case 'logout':
          if (data.user && data.token) {
            Auth.logout(data.user, data.token, function(logout){
              if(logout){
                res.end(JSON.stringify({
                  err: false
                }))
              } else {
                res.end(JSON.stringify({
                  err: 'Wrong User or Token.'
                }))
              }
            })
          } else {
            res.end(JSON.stringify({
              err: 'Missing User or Token.'
            }))
          }
          break

        case 'register':
          if (data.user && data.pass && data.invite) {
            Auth.register(data.user, data.pass, data.invite, function(token){
              if (token) {
                res.cookie('token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
                res.cookie('user', data.user, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
                res.end(JSON.stringify({
                  err: false,
                  token: token
                }))
              } else {
                res.end(JSON.stringify({
                  err: 'Wrong User, Pass or Invitation code.'
                }))
              }
            })
          } else {
            res.end(JSON.stringify({
              err: 'Missing User, Pass or Invitation code.'
            }))
          }
          break

        case 'invite':
          if (data.invitationKey) {
            var invite = Auth.createInvite(data.invitationKey)
            if (invite) {
              res.end(JSON.stringify({
                err: false,
                invitationCode: invite
              }))
            } else {
              res.end(JSON.stringify({
                err: 'Wrong Invitation Key.'
              }))
            }
          } else {
            res.end(JSON.stringify({
              err: 'Missing Invitation Key.'
            }))
          }
          break
      }
    } else {
      res.end(JSON.stringify({
        err: 'Missing Todo.'
      }))
    }
  })
}

module.exports = new Server()
