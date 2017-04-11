'use strict'

var path = require('path')
var fs = require('fs')
var rand = require('crypto-rand')
var request = require('request')
var Crypto = require('crypto-js')

global.__base = path.join(__dirname, '..', '/')
global.__workingDir = path.join(__base, 'src')

var Config = require(path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(path.join(__base, 'configs/config.json'))
global.__config.server.port = process.env.PORT || global.__config.server.port

global.__config.authentification.status = process.env.AUTH

var Rand = require('crypto-rand')
var Crypto = require('crypto-js')
var token = Crypto.SHA256(Rand.rand().toString()).toString()

global.__DBtoken = token

var Database = require(path.join(__base, 'src/database/server.js'))
var DBPort = process.env.DB_PORT || global.__config.database.port
var DB = new Database(DBPort, token)

var assert = require('chai').assert

describe('Fontend', function () {})

describe('Backend', function () {
  describe('Log', function () {
    var Log = require(path.join(__base, 'src/worker/log.js'))
    var LogWorker = new Log()
    var LogWorker2 = new Log({})
    it('Log info', function (done) {
      LogWorker.info('This is an info.')
      done()
    })
    it('Log warning', function (done) {
      LogWorker.warning('This is a warning.')
      done()
    })
    it('Log error', function (done) {
      LogWorker.error('This is an error.')
      done()
    })
  })
  describe('Auth', function () {
    var username = 'foo' + rand.rand()
    var username2 = 'foo2' + rand.rand()

    var Auth = require(path.join(__base, 'src/worker/auth.js'))
    describe('createInvite()', function () {
      it('Invite key: ' + __config.server.masterKey, function (done) {
        Auth.createInvite(__config.server.masterKey, function (invite) {
          assert.typeOf(invite, 'string')
          done()
        })
      })
      it('Invite key: Unknown', function (done) {
        Auth.createInvite('', function (invite) {
          assert(!invite)
          done()
        })
      })
    })
    describe('Register()', function () {
      it('User: foo, Pass: bar, Invite: Valid invitation', function (done) {
        Auth.createInvite(__config.server.masterKey, function (invite) {
          Auth.register(username, 'bar', invite, function (token) {
            assert.typeOf(token, 'string')
            done()
          })
        })
      })
      it('User: foo, Pass: bar, Invite: Valid invitation', function (done) {
        Auth.createInvite(__config.server.masterKey, function (invite) {
          Auth.register(username, 'bar', invite, function (token) {
            assert(!token)
            done()
          })
        })
      })
      it('User: foo, Pass: bar, Invite: Invalid invitation', function (done) {
        Auth.register(username2, 'bar', '', function (token) {
          assert(!token)
          done()
        })
      })
    })
    describe('Loggin()', function () {
      it('User: foo, Pass: bar', function (done) {
        Auth.login(username, 'bar', 'localhost', 86400000, function (token) {
          assert.typeOf(token, 'string')
          done()
        })
      })
      it('User: Unknown, Pass: bar', function (done) {
        Auth.login(username2, 'bar', 'localhost', 86400000, function (token) {
          assert(!token)
          done()
        })
      })
      it('User: foo, Pass: Wrong', function (done) {
        Auth.login(username, 'test', 'localhost', 86400000, function (token) {
          assert(!token)
          done()
        })
      })
    })
    describe('Logout()', function () {
      it('User: foo, Token: valid', function (done) {
        Auth.login(username, 'bar', 'localhost', 86400000, function (token) {
          Auth.logout(username, token, function (loggedOut) {
            assert(loggedOut)
            done()
          })
        })
      })
      it('User: Unknown, Token: valid', function (done) {
        Auth.logout(username2, '', function (loggedOut) {
          assert(!loggedOut)
          done()
        })
      })
      it('User: foo, Token: invalid', function (done) {
        Auth.login(username, 'bar', 'localhost', 86400000, function (token) {
          Auth.logout(username, token + '1', function (loggedOut) {
            assert(!loggedOut)
            done()
          })
        })
      })
    })
    describe('ChangePass()', function () {
      it('Change password User: foo, OldPass: bar, NewPass: rab', function (done) {
        Auth.changePass(username, 'bar', 'rab', function (passwordChanged) {
          assert(passwordChanged)
          done()
        })
      })
      it('Change password User: Unknown, OldPass: bar, NewPass: rab', function (done) {
        Auth.changePass(username2, 'bar', 'rab', function (passwordChanged) {
          assert(!passwordChanged)
          done()
        })
      })
      it('Change password User: foo, OldPass: Wrong, NewPass: rab', function (done) {
        Auth.changePass(username, 'bar1', 'rab', function (passwordChanged) {
          assert(!passwordChanged)
          done()
        })
      })
      it('Change password User: foo, OldPass: rad, NewPass: bar', function (done) {
        Auth.changePass(username, 'rab', 'bar', function (passwordChanged) {
          assert(passwordChanged)
          done()
        })
      })
    })
    describe('CheckLogged()', function () {
      it('User: foo', function (done) {
        Auth.login(username, 'bar', 'localhost', 86400000, function (token) {
          Auth.checkLogged(username, token, function (isLogged) {
            assert(isLogged)
            done()
          })
        })
      })
      it('User: Unknown', function (done) {
        Auth.checkLogged(username2, '', function (isLogged) {
          assert(!isLogged)
          done()
        })
      })
    })
    describe('LastSeen()', function () {
      it('User: foo', function (done) {
        Auth.lastSeen(username, function (timestamp) {
          assert(timestamp)
          done()
        })
      })
    })
  })
  describe('MediaInfo', function () {
    var MediaInfo = require(path.join(__base, 'src/worker/mediaInfo.js'))
    describe('GetInfo()', function () {
      this.timeout(30000)
      it('Type: series, Query: Game of thrones', function (done) {
        MediaInfo.getInfo('series', 'Game of Thrones', function (res) {
          assert.equal(res.query, 'Game of Thrones')
          done()
        })
      })
      it('Type: movie, Query: Alien', function (done) {
        MediaInfo.getInfo('films', 'Alien', function (res) {
          assert.equal(res.query, 'Alien')
          done()
        })
      })
      it('Type: movie, Query: Unknown', function (done) {
        MediaInfo.getInfo('films', 'blbablabla', function (res) {
          assert.typeOf(res.err, 'string')
          done()
        })
      })
    })
  })
  describe('SearchTorrent', function () {
    var SearchT = require(path.join(__base, 'src/worker/searchtorrent.js'))
    describe('Search()', function () {
      this.timeout(30000)
      it('Search: Game of thrones', function (done) {
        SearchT.search('Game of Thrones', function (res) {
          assert.typeOf(res, 'object')
          assert(res.tv)
          assert(res.mv)
          done()
        })
      })
    })
    describe('Latest()', function () {
      this.timeout(30000)
      it('Get latest', function (done) {
        SearchT.latest(function (res) {
          assert.typeOf(res, 'object')
          assert(res.tv)
          assert(res.mv)
          done()
        })
      })
    })
  })
  describe('Client', function () {
    var Client = require(path.join(__base, 'src/worker/client.js'))
    var ClientWorker = new Client()
    describe('Dowload()', function () {
      this.timeout(305000)
      it('Dowload ubuntu', function (done) {
        ClientWorker.download('magnet:?xt=urn:btih:63c393906fc843e7e4d1cba6bd4c5e16bf9e8e4b&dn=CentOS-7-x86_64-NetInstall-1511', 'magnet:?xt=urn:btih:63c393906fc843e7e4d1cba6bd4c5e16bf9e8e4b&dn=CentOS-7-x86_64-NetInstall-1511',
          function (hash) {
            assert.equal(hash, '63c393906fc843e7e4d1cba6bd4c5e16bf9e8e4b')
          }, function () {
            ClientWorker.stop()
            done()
          })
      })
    })
  })
  describe('Server', function () {
    var Server = require(path.join(__base, 'src/controller/main.js'))
    var ServerWorker = new Server(1)
    var url = 'http://localhost:' + __config.server.port
    var user = 'test' + rand.rand()
    var pass = 'test'
    describe('POST and GET Auth', function () {
      it('get / without login', function (done) {
        this.timeout(30000)
        request(url, function (err, res, body) {
          assert(!err)
          if (!err && res.statusCode === 200) {
            assert(body.match('<title>Login - Lunik - Torrent</title>'))
          }
          done()
        })
      })
      it('genInvite + register + login + changePass + logout', function (done) {
        // gentoken
        request.get({
          url: url + '/auth/invite',
          qs: {
            masterKey: __config.server.masterKey
          }
        }, function (err, res, body) {
          assert(!err)
          if (!err && res.statusCode === 200) {
            var invite = JSON.parse(body).invitationCode
            assert(invite)
          }
        })
        request.post({
          url: url + '/auth/invite',
          form: {
            masterKey: __config.server.masterKey
          }
        }, function (err, res, body) {
          assert(!err)
          if (!err && res.statusCode === 200) {
            var invite = JSON.parse(body).invitationCode
            assert(invite)
            // register
            request.post({
              url: url + '/auth/register',
              form: {
                user: user,
                pass: pass,
                invite: invite
              }
            }, function (err, res, body) {
              assert(!err)
              if (!err && res.statusCode === 200) {
                var token = JSON.parse(body).token
                assert(token)
                // login
                request.post({
                  url: url + '/auth/login',
                  form: {
                    user: user,
                    pass: pass
                  }
                }, function (err, res, body) {
                  assert(!err)
                  if (!err && res.statusCode === 200) {
                    var token = JSON.parse(body).token
                    assert(token)
                    // logout
                    request.post({
                      url: url + '/auth/logout',
                      form: {
                        user: user,
                        token: token
                      }
                    }, function (err, res, body) {
                      assert(!err)
                      if (!err && res.statusCode === 200) {
                        err = JSON.parse(body).err
                        assert(!err)
                        request.post({
                          url: url + '/auth/changepass',
                          form: {
                            user: user,
                            oldpass: pass,
                            newpass: pass + 1
                          }
                        }, function (err, res, body) {
                          assert(!err)
                          if (!err && res.statusCode === 200) {
                            err = JSON.parse(body).err
                            assert(!err)
                            request.post({
                              url: url + '/auth/changepass',
                              form: {
                                user: user,
                                oldpass: pass + 1,
                                newpass: pass
                              }
                            }, function (err, res, body) {
                              assert(!err)
                              if (!err && res.statusCode === 200) {
                                err = JSON.parse(body).err
                                assert(!err)
                              }
                              done()
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      })
      it('GET /files', function (done) {
        Auth(url, user, pass, function (token) {
          var file = 'ok' + rand.rand()
          var r = rand.rand()
          fs.writeFile(path.join(__base, __config.directory.path, file), r, function (err) {
            assert(!err)
            request.get({
              url: url + '/files?f=' + file,
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              }
            }, function (err, res, body) {
              assert(!err)
              if (!err && res.statusCode === 200) {
                assert.equal(body, r)
                assert(!JSON.parse(body).err)
              }
              done()
            })
          })
        })
      })
      it('GET /direct', function () {
        var file = 'ok' + rand.rand()
        var r = rand.rand()
        fs.writeFile(path.join(__base, __config.directory.path, file), r, function (err) {
          assert(!err)
          request.get({
            url: url + '/directdl/' + Crypto.AES.encode(file, '').toString()
          }, function (err, res, body) {
            assert(!err)
            if (!err && res.statusCode === 200) {
              assert.equal(body, r)
              assert(!JSON.parse(body).err)
            }
            done()
          })
        })
      })
      it('POST List-t', function (done) {
        Auth(url, user, pass, function (token) {
          request.get({
            url: url + '/torrent/list',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            }
          }, function (err, res, body) {
            if (!err && res.statusCode === 200) {
              body = JSON.parse(body)
              assert(!body.err)
              assert(Array.isArray(body))
            }
            done()
          })
        })
      })
      it('GET List-d', function (done) {
        Auth(url, user, pass, function (token) {
          var dir = 'ok' + rand.rand()
          fs.mkdir(path.join(__base, __config.directory.path, dir), function (err) {
            assert(!err)
            request.get({
              url: url + '/directory/list',
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              },
              qs: {
                dir: dir
              }
            }, function (err, res, body) {
              if (!err && res.statusCode === 200) {
                body = JSON.parse(body)
                assert(!body.err)
                assert.typeOf(body, 'object')
              }
              done()
            })
          })
        })
      })
      it('POST remove-d', function (done) {
        Auth(url, user, pass, function (token) {
          var file = 'ok' + rand.rand()
          fs.writeFile(path.join(__base, __config.directory.path, file), 'ok', function (err) {
            assert(!err)
            request.post({
              url: url + '/directory/remove',
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              },
              form: {
                file: file
              }
            }, function (err, res, body) {
              if (!err && res.statusCode === 200) {
                body = JSON.parse(body)
                assert(!body.err)
                assert.equal(body.file, file)
                done()
              }
            })
          })
        })
      })
      it('POST rename-d', function (done) {
        Auth(url, user, pass, function (token) {
          var file = 'ok' + rand.rand()
          var file2 = 'ok' + rand.rand()
          fs.writeFile(path.join(__base, __config.directory.path, file), 'ok', function (err) {
            assert(!err)
            request.post({
              url: url + '/directory/rename',
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              },
              form: {
                path: '/',
                oldname: file,
                newname: file2
              }
            }, function (err, res, body) {
              if (!err && res.statusCode === 200) {
                body = JSON.parse(body)
                assert(!body.err)
                assert.equal(body.oldname, file)
                assert.equal(body.newname, file2)
                done()
              }
            })
          })
        })
      })
      it('POST mdkir-d', function (done) {
        Auth(url, user, pass, function (token) {
          var dir = 'ok' + rand.rand()
          request.post({
            url: url + '/directory/mkdir',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              path: '/',
              name: dir
            }
          }, function (err, res, body) {
            if (!err && res.statusCode === 200) {
              body = JSON.parse(body)
              assert(!body.err)
              assert.equal(body.name, dir)
              done()
            }
          })
        })
      })
      it('POST mdkir-d', function (done) {
        Auth(url, user, pass, function (token) {
          var dir = 'ok' + rand.rand()
          var file = 'ok' + rand.rand()
          fs.mkdir(path.join(__base, __config.directory.path, dir), function (err) {
            assert(!err)
            fs.writeFile(path.join(__base, __config.directory.path, file), 'ok', function (err) {
              assert(!err)
              request.post({
                url: url + '/directory/mv',
                headers: {
                  Cookie: 'user=' + user + ';token=' + token
                },
                form: {
                  path: '/',
                  file: file,
                  folder: dir
                }
              }, function (err, res, body) {
                if (!err && res.statusCode === 200) {
                  body = JSON.parse(body)
                  assert(!body.err)
                  assert.equal(body.file, file)
                  done()
                }
              })
            })
          })
        })
      })
      it('POST search-t', function (done) {
        this.timeout(30000)
        Auth(url, user, pass, function (token) {
          request.post({
            url: url + '/torrent/search',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              query: 'Game of Thrones'
            }
          }, function (err, res, body) {
            if (!err && res.statusCode === 200) {
              body = JSON.parse(body)
              assert(!body.err)
              assert.typeOf(body, 'object')
              done()
            }
          })
        })
      })
      it('GET info-d', function (done) {
        this.timeout(30000)
        Auth(url, user, pass, function (token) {
          request.get({
            url: url + '/directory/info',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            qs: {
              type: 'series',
              query: 'Game of Thrones'
            }
          }, function (err, res, body) {
            if (!err && res.statusCode === 200) {
              body = JSON.parse(body)
              assert(!body.err)
              assert.typeOf(body, 'object')
              done()
            }
          })
        })
      })
      it('GET lock-d', function (done) {
        var file = 'ok' + rand.rand()
        Auth(url, user, pass, function (token) {
          fs.writeFile(path.join(__base, __config.directory.path, file), 'ok', function (err) {
            assert(!err)
            request.get({
              url: url + '/directory/lock?f=' + file,
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              }
            }, function (err, res, body) {
              if (!err && res.statusCode === 200) {
                body = JSON.parse(body)
                assert(!body.err)
                done()
              }
            })
          })
        })
      })
      it('POST download-t && remove-t', function (done) {
        this.timeout(30000)
        Auth(url, user, pass, function (token) {
          request.post({
            url: url + '/torrent/download',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              url: 'magnet:?xt=urn:btih:fe00c3de0ce28bcc6724f309aa8e0fcc5e6e0bf4&dn=CentOS-6.8-i386-netinstall'
            }
          }, function (err, res, body) {
            if (!err && res.statusCode === 200) {
              body = JSON.parse(body)
              assert(!body.err)
              request.post({
                url: url + '/torrent/remove',
                headers: {
                  Cookie: 'user=' + user + ';token=' + token
                },
                form: {
                  hash: 'fe00c3de0ce28bcc6724f309aa8e0fcc5e6e0bf4'
                }
              }, function (err, res, body) {
                if (!err && res.statusCode === 200) {
                  body = JSON.parse(body)
                  assert.equal(body.hash, 'fe00c3de0ce28bcc6724f309aa8e0fcc5e6e0bf4')
                  assert(!body.err)
                }
                done()
              })
            }
          })
        })
      })
    })
  })
  describe('Directory', function () {
    var Directory = require(path.join(__base, 'src/worker/directory.js'))
    describe('Mkdir()', function () {
      it('Create dir', function (done) {
        Directory.mkdir('/', 'ok' + rand.rand())
        done()
      })
    })
    describe('List()', function () {
      it('Scan / ', function (done) {
        Directory.list('/', function (folder) {
          assert.typeOf(folder, 'object')
          done()
        })
      })
    })
    describe('Mv()', function () {
      it('Mv dir into dir', function (done) {
        var recip = 'ok' + rand.rand()
        var dir = 'ok' + rand.rand()
        Directory.mkdir('/', recip)
        Directory.mkdir('/', dir)
        Directory.mv('/', dir, recip, function (err) {
          assert(!err)
          done()
        })
      })
    })
    describe('Rename()', function () {
      it('change dir name', function (done) {
        var dir = 'ok' + rand.rand()
        var newname = 'ok' + rand.rand()
        Directory.mkdir('/', dir)
        Directory.rename('/', dir, newname, function (err) {
          assert(!err)
          done()
        })
      })
    })
    describe('SetOwner()', function () {
      it('setOwner of dir', function (done) {
        var dir = 'ok' + rand.rand()
        Directory.mkdir('/', dir)
        Directory.setOwner(dir, 'test')
        done()
      })
    })
    describe('Remove()', function () {
      it('remove dir', function (done) {
        var dir = 'ok' + rand.rand()
        Directory.mkdir('/', dir)
        Directory.remove(dir, function (err) {
          assert(!err)
          done()
        })
      })
    })
    describe('Downloading()', function () {
      it('setDownloading', function (done) {
        var dir = 'ok' + rand.rand()
        Directory.mkdir('/', dir)
        Directory.setDownloading(dir, function (err) {
          assert(!err)
          Directory.setDownloading(dir, function (err) {
            assert(!err)
            Directory.isDownloading(dir, function (isdl) {
              assert(isdl)
              Directory.finishDownloading(dir, function (err) {
                assert(!err)
                Directory.finishDownloading(dir, function (err) {
                  assert(!err)
                  done()
                })
              })
            })
          })
        })
      })
    })
  })
  describe('torrent', function () {
    var Torrent = require(path.join(__base, 'src/worker/torrent.js'))
    describe('Start()', function () {
      it('start multiple torrent', function (done) {
        this.timeout(300000)
        Torrent.start('nobody', 'magnet:?xt=urn:btih:406bcd979f0f2650e859324d97efd0a1139328a0&dn=CentOS-5.11-i386-netinstall')
        Torrent.start('nobody', 'magnet:?xt=urn:btih:2700d4801a22ab198428bf1b4a85b097bf0497d3&dn=CentOS-5.11-x86_64-netinstall')
        Torrent.start('nobody', 'magnet:?xt=urn:btih:90289fd34dfc1cf8f316a268add8354c85334458&dn=ubuntu-16.04.1-server-amd64.iso')
        Torrent.start('nobody', 'magnet:?xt=urn:btih:6bf4c6b4b86dbfcc79180b042abc2bd60a9ca3a4&dn=ubuntu-16.10-server-i386.iso')
        setTimeout(function () {
          done()
        }, 10000)
      })
    })
    describe('remove()', function () {
      it('start and remove', function (done) {
        this.timeout(300000)
        Torrent.start('nobody', 'magnet:?xt=urn:btih:288f8018277b8c474f304a059b064e017bd55e9f&dn=ubuntu-16.04.1-server-i386.iso')
        setTimeout(function () {
          Torrent.getInfo(function (data) {
            assert(Array.isArray(data))
            Torrent.remove('288f8018277b8c474f304a059b064e017bd55e9f')
            done()
          })
        }, 10000)
      })
    })
  })
})

function Auth (url, user, pass, cb) {
  request.post({
    url: url + '/auth/login',
    form: {
      user: user,
      pass: pass
    }
  }, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      var token = JSON.parse(body).token
      cb(token)
    }
  })
}
