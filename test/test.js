'use strict'

var path = require('path')
var fs = require('fs')
var rand = require('crypto-rand')
var request = require('request')

global.__base = path.join(__dirname, '..', '/')

var Config = require(path.join(__base, 'src/worker/config.js'))
var ConfigWorker = new Config()
global.__config = ConfigWorker.load(path.join(__base, 'configs/config.json'))
global.__config.server.port = process.env.PORT || global.__config.server.port

var assert = require('chai').assert

describe('Fontend', function () {})

describe('Backend', function () { 
  describe('Auth', function () {
    var username = 'foo' + rand.rand()
    var username2 = 'foo2' + rand.rand()

    var Auth = require(path.join(__base, 'src/worker/auth.js'))
    describe('createInvite()', function () {
      it('Invite key: ' + __config.server.invitationKey, function (done) {
        assert.typeOf(Auth.createInvite(__config.server.invitationKey), 'string')
        done()
      })
      it('Invite key: Unknown', function (done) {
        assert(!Auth.createInvite(''))
        done()
      })
    })
    describe('Register()', function () {
      it('User: foo, Pass: bar, Invite: Valid invitation', function (done) {
        var invite = Auth.createInvite(__config.server.invitationKey)
        assert.typeOf(Auth.register(username, 'bar', invite), 'string')
        done()
      })
      it('User: foo, Pass: bar, Invite: Valid invitation', function (done) {
        var invite = Auth.createInvite(__config.server.invitationKey)
        assert(!Auth.register(username, 'bar', invite))
        done()
      })
      it('User: foo, Pass: bar, Invite: Invalid invitation', function (done) {
        assert(!Auth.register(username2, 'bar', ''))
        done()
      })
    })
    describe('Loggin()', function () {
      it('User: foo, Pass: bar', function (done) {
        assert.typeOf(Auth.login(username, 'bar'), 'string')
        done()
      })
      it('User: Unknown, Pass: bar', function (done) {
        assert(!Auth.login(username2, 'bar'))
        done()
      })
      it('User: foo, Pass: Wrong', function (done) {
        assert(!Auth.login(username, 'test'))
        done()
      })
    })
    describe('Logout()', function () {
      it('User: foo, Token: valid', function (done) {
        var token = Auth.login(username, 'bar')
        assert(Auth.logout(username, token))
        done()
      })
      it('User: Unknown, Token: valid', function (done) {
        assert(!Auth.logout(username2, ''))
        done()
      })
      it('User: foo, Token: invalid', function (done) {
        var token = Auth.login(username, 'bar')
        assert(!Auth.logout(username, token + '1'))
        done()
      })
    })
    describe('ChangePass()', function () {
      it('Change password User: foo, OldPass: bar, NewPass: rab', function (done) {
        assert(Auth.changePass(username, 'bar', 'rab'))
        done()
      })
      it('Change password User: Unknown, OldPass: bar, NewPass: rab', function (done) {
        assert(!Auth.changePass(username2, 'bar', 'rab'))
        done()
      })
      it('Change password User: foo, OldPass: Wrong, NewPass: rab', function (done) {
        assert(!Auth.changePass(username, 'bar1', 'rab'))
        done()
      })
      it('Change password User: foo, OldPass: rad, NewPass: bar', function (done) {
        assert(Auth.changePass(username, 'rab', 'bar'))
        done()
      })
    })
    describe('CheckLogged()', function () {
      it('User: foo', function (done) {
        var token = Auth.login(username, 'bar')
        assert(Auth.checkLogged(username, token))
        done()
      })
      it('User: Unknown', function (done) {
        assert(!Auth.checkLogged(username2, ''))
        done()
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
  describe('SearchT', function () {
    var SearchT = require(path.join(__base, 'src/worker/searchT.js'))
    describe('Search()', function () {
      this.timeout(30000)
      it('Search: Game of thrones', function (done) {
        SearchT.search('Game of Thrones', function (res) {
          assert.typeOf(res, 'object')
          assert(res.tven)
          assert(res.tvfr)
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
    describe('On()', function () {
      it('Add startFunction', function (done) {
        ClientWorker.on('start', function (hash) {
          assert.typeOf(hash, 'string')
        })
        done()
      })
      it('Add updateFunction', function (done) {
        ClientWorker.on('download', function (torrent) {
          assert.typeOf(torrent, 'object')
          assert.typeOf(torrent.name, 'string')
        })
        done()
      })
      it('Add doneFunction', function (done) {
        ClientWorker.on('done', function (err, hash, name) {
          assert(!err)
          assert.typeOf(hash, 'string')
          assert.typeOf(name, 'string')
        })
        done()
      })
    })
    describe('Dowload()', function () {
      this.timeout(300000)
      it('Dowload sintel', function (done) {
        ClientWorker.on('done', function (err, hash, name) {
          ClientWorker.stop()
          done()
        })
        ClientWorker.download('magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4', function(){})
      })
    })
  })
  describe('Server', function () {
    var Server = require(path.join(__base, 'src/worker/server.js'))
    var url = 'http://localhost:' + __config.server.port
    var user = 'test' + rand.rand()
    var pass = 'test'
    describe('POST and GET Auth', function () {
      it('get / without login', function (done) {
        request(url, function (err, res, body) {
          assert(!err)
          if (!err && res.statusCode == 200) {
            assert(body.match('<title>Login - Lunik - Torrent</title>'))
          }
          done()
        })
      })
      it('genInvite + register + login + changePass + logout', function (done) {
        // gentoken
        request.post({
          url: url + '/auth?todo=invite',
          form: {
            invitationkey: __config.server.invitationKey
          }
        }, function (err, res, body) {
          assert(!err)
          if (!err && res.statusCode == 200) {
            var invite = JSON.parse(body).invitationCode
            assert(invite)
            // register
            request.post({
              url: url + '/auth?todo=register',
              form: {
                user: user,
                pass: pass,
                invite: invite
              }
            }, function (err, res, body) {
              assert(!err)
              if (!err && res.statusCode == 200) {
                var token = JSON.parse(body).token
                assert(token)
                // login
                request.post({
                  url: url + '/auth?todo=login',
                  form: {
                    user: user,
                    pass: pass
                  }
                }, function (err, res, body) {
                  assert(!err)
                  if (!err && res.statusCode == 200) {
                    var token = JSON.parse(body).token
                    assert(token)
                    // logout
                    request.post({
                      url: url + '/auth?todo=logout',
                      form: {
                        user: user,
                        token: token
                      }
                    }, function (err, res, body) {
                      assert(!err)
                      if (!err && res.statusCode == 200) {
                        var err = JSON.parse(body).err
                        assert(!err)
                        request.post({
                          url: url + '/auth?todo=changepass',
                          form: {
                            user: user,
                            oldpass: pass,
                            newpass: pass+1
                          }
                        }, function (err, res, body) {
                          assert(!err)
                          if (!err && res.statusCode == 200) {
                            var err = JSON.parse(body).err
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
      })
      it('GET /files', function (done) {
        Auth(url, user, pass, function (token) {
          var file = 'ok' + rand.rand()
          var r = rand.rand()
          fs.writeFile(path.join(__base, __config.directory.path, file), r , function (err) {
            assert(!err)
            request.get({
              url: url + '/files?f=' + file,
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              }
            }, function (err, res, body) {
              assert(!err)
              if (!err && res.statusCode == 200) {
                assert.equal(body, r)
                assert(!JSON.parse(body).err)
              }
              done()
            })
          })
        })
      })
      it('POST List-t', function (done) {
        Auth(url, user, pass, function (token) {
          request.post({
            url: url + '/list-t',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            }
          }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
              body = JSON.parse(body)
              assert(!body.err)
              assert.typeOf(body, 'object')
            }
            done()
          })
        })
      })
      it('POST List-d', function (done) {
        Auth(url, user, pass, function (token) {
          var dir = 'ok' + rand.rand()
          fs.mkdir(path.join(__base, __config.directory.path, dir), function (err) {
            assert(!err)
            request.post({
              url: url + '/list-d',
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              },
              form: {
                dir: dir
              }
            }, function (err, res, body) {
              if (!err && res.statusCode == 200) {
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
              url: url + '/remove-d',
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              },
              form: {
                file: file
              }
            }, function (err, res, body) {
              if (!err && res.statusCode == 200) {
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
              url: url + '/rename-d',
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              },
              form: {
                path: '/',
                oldname: file,
                newname: file2
              }
            }, function (err, res, body) {
              if (!err && res.statusCode == 200) {
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
            url: url + '/mkdir-d',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              path: '/',
              name: dir
            }
          }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
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
                url: url + '/mv-d',
                headers: {
                  Cookie: 'user=' + user + ';token=' + token
                },
                form: {
                  path: '/',
                  file: file,
                  folder: dir
                }
              }, function (err, res, body) {
                if (!err && res.statusCode == 200) {
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
            url: url + '/search-t',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              query: 'Game of Thrones'
            }
          }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
              body = JSON.parse(body)
              assert(!body.err)
              assert.typeOf(body, 'object')
              done()
            }
          })
        })
      })
      it('POST info-d', function (done) {
        this.timeout(30000)
        Auth(url, user, pass, function (token) {
          request.post({
            url: url + '/info-d',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              type: 'series',
              query: 'Game of Thrones'
            }
          }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
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
              url: url + '/lock-d?f='+file,
              headers: {
                Cookie: 'user=' + user + ';token=' + token
              }
            }, function (err, res, body) {
              if (!err && res.statusCode == 200) {
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
            url: url + '/download-t',
            headers: {
              Cookie: 'user=' + user + ';token=' + token
            },
            form: {
              url: 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4'
            }
          }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
              body = JSON.parse(body)
              assert(!body.err)
              request.post({
                url: url + '/remove-t',
                headers: {
                  Cookie: 'user=' + user + ';token=' + token
                },
                form: {
                  hash: '6a9759bffd5c0af65319979fb7832189f4f3c35d'
                }
              }, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                  body = JSON.parse(body)
                  assert.equal(body.hash, '6a9759bffd5c0af65319979fb7832189f4f3c35d')
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
    describe('saveFileInfo()', function () {
      it('Save', function (done) {
        Directory.saveFileInfo()
        done()
      })
    })
    describe('Mkdir()', function () {
      it('Create dir', function (done) {
        Directory.mkdir('/', 'ok' + rand.rand())
        done()
      })
    })
    describe('List()', function () {
      it('Scan / ', function (done) {
        Directory.list('/', function(folder){
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
        Directory.mv('/', dir, recip)
        done()
      })
    })
    describe('Rename()', function () {
      it('change dir name', function (done) {
        var dir = 'ok' + rand.rand()
        var newname = 'ok' + rand.rand()
        Directory.mkdir('/', dir)
        Directory.rename('/', dir, newname)
        done()
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
        Directory.remove(dir)
        done()
      })
    })
    describe('Downloading()', function () {
      it('setDownloading', function (done) {
        var dir = 'ok' + rand.rand()
        Directory.mkdir('/', dir)
        Directory.setDownloading(dir)
        Directory.setDownloading(dir)
        Directory.isDownloading(dir)
        Directory.finishDownloading(dir)
        Directory.finishDownloading(dir)
        done()
      })
      it('updateDownloads', function (done) {
        Directory.updateDownloads()
        done()
      })
    })
  })
  describe('torrent', function () {
    var Torrent = require(path.join(__base, 'src/worker/torrent.js'))
    describe('Start()', function () {
      it('startPointTorrent()', function (done) {
        this.timeout(300000)
        Torrent.setDownloader('admin', 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4')
        fs.writeFile(path.join(__base, __config.torrent.scanTorrent),
          'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4'
          + 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4'
          + 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4'
          + 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4'
          + 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4', function (err) {
            assert(!err)
            Torrent.startPointTorrent(Torrent)
            setTimeout(function () {
              done()
            }, 60000)
          })
      })
    })
    describe('remove()', function () {
      it('start and remove', function (done) {
        this.timeout(300000)
        Torrent.start('magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4')
        setTimeout(function () {
          assert.typeOf(Torrent.getInfo(), 'object')
          Torrent.getUrlFromHash('6a9759bffd5c0af65319979fb7832189f4f3c35d')
          Torrent.remove('6a9759bffd5c0af65319979fb7832189f4f3c35d')
          done()
        }, 10000)
      })
    })
  })
})

function Auth (url, user, pass, cb) {
  request.post({
    url: url + '/auth?todo=login',
    form: {
      user: user,
      pass: pass
    }
  }, function (err, res, body) {
    if (!err && res.statusCode == 200) {
      var token = JSON.parse(body).token
      cb(token)
    }
  })
}
