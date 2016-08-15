'use strict'

var path = require('path')
var fs = require('fs')
var rand = require('crypto-rand')

global.__base = path.join(__dirname, '..', '/')
global.__config = require(path.join(__base, 'configs/config.json'))

var assert = require('chai').assert

describe('Fontend', function(){

})

describe('Backend', function(){
  describe('Auth', function(){
    var username = 'foo' + rand.rand()
    var username2 = 'foo2' + rand.rand()

    var Auth = require(path.join(__base, 'src/auth.js'))
    describe('createInvite()', function(){
      it('Invite key: ' + __config.server.invitationKey, function(done){
        assert.typeOf(Auth.createInvite(__config.server.invitationKey), 'string')
        done()
      })
      it('Invite key: Unknown', function(done){
        assert(!Auth.createInvite(''))
        done()
      })
    })
    describe('Register()', function(){
      it('User: foo, Pass: bar, Invite: Valid invitation', function(done){
        var invite = Auth.createInvite(__config.server.invitationKey)
        assert.typeOf(Auth.register(username, 'bar', invite), 'string')
        done()
      })
      it('User: foo, Pass: bar, Invite: Valid invitation', function(done){
        var invite = Auth.createInvite(__config.server.invitationKey)
        assert(!Auth.register(username, 'bar', invite))
        done()
      })
      it('User: foo, Pass: bar, Invite: Invalid invitation', function(done){
        assert(!Auth.register(username2, 'bar', ''))
        done()
      })
    })
    describe('Loggin()', function(){
      it('User: foo, Pass: bar', function(done){
        assert.typeOf(Auth.login(username, 'bar'), 'string')
        done()
      })
      it('User: Unknown, Pass: bar', function(done){
        assert(!Auth.login(username2, 'bar'))
        done()
      })
      it('User: foo, Pass: Wrong', function(done){
        assert(!Auth.login(username, 'test'))
        done()
      })
    })
    describe('Logout()', function(){
      it('User: foo, Pass: bar', function(done){
        var token = Auth.login(username, 'bar')
        assert(Auth.logout(username, token))
        done()
      })
      it('User: Unknown, Pass: bar', function(done){
        assert(!Auth.logout(username2, ''))
        done()
      })
      it('User: foo, Pass: Wrong', function(done){
        var token = Auth.login(username, 'bar')
        assert(!Auth.logout(username, token+'1'))
        done()
      })
    })
    describe('CheckLogged()', function(){
      it('User: foo', function(done){
        var token = Auth.login(username, 'bar')
        assert(Auth.checkLogged(username, token))
        done()
      })
      it('User: Unknown', function(done){
        assert(!Auth.checkLogged(username2, ''))
        done()
      })
    })
  })
  describe('MediaInfo', function(){
    var MediaInfo = require(path.join(__base, 'src/mediaInfo.js'))
    describe('GetInfo()', function(){
      this.timeout(30000)
      it('Type: series, Query: Game of thrones', function(done){
        MediaInfo.getInfo('series', 'Game of Thrones', function(res){
          assert.equal(res.query, 'Game of Thrones')
          done()
        })
      })
      it('Type: movie, Query: Alien', function(done){
        MediaInfo.getInfo('films', 'Alien', function(res){
          assert.equal(res.query, 'Alien')
          done()
        })
      })
      it('Type: movie, Query: Unknown', function(done){
        MediaInfo.getInfo('films', 'blbablabla', function(res){
          assert.typeOf(res.err, 'string')
          done()
        })
      })
    })
  })
  describe('SearchT', function(){
    var SearchT = require(path.join(__base, 'src/searchT.js'))
    describe('Search()', function(){
      this.timeout(30000)
      it('Search: Game of thrones', function(done){
        SearchT.search('Game of Thrones', function(res){
          assert.typeOf(res, 'object')
          assert(res.tven)
          assert(res.tvfr)
          assert(res.mv)
          done()
        })
      })
    })
    describe('Latest()', function(){
      this.timeout(30000)
      it('Get latest', function(done){
        SearchT.latest(function(res){
          assert.typeOf(res, 'object')
          assert(res.tv)
          assert(res.mv)
          done()
        })
      })
    })
  })
  describe('Client', function(){
    var Client = require(path.join(__base, 'src/client.js'))
    var ClientWorker = new Client()
    describe('On()', function(){
      it('Add startFunction', function(done){
        ClientWorker.on('start', function(hash){
          assert.typeOf(hash, 'string')
        })
        done()
      })
      it('Add updateFunction', function(done){
        ClientWorker.on('download', function(torrent){
          assert.typeOf(torrent, 'object')
          assert.typeOf(torrent.name, 'string')
        })
        done()
      })
      it('Add doneFunction', function(done){
        ClientWorker.on('done', function(err, hash, name){
          assert(!err)
          assert.typeOf(hash, 'string')
          assert.typeOf(name, 'string')
        })
        done()
      })
    })
    describe('Dowload()', function(){
      this.timeout(300000)
      it('Dowload sintel', function(done){
        ClientWorker.on('done', function(err, hash, name){
          ClientWorker.stop()
          done()
        })
        ClientWorker.download('magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4')
      })
    })
  })
})
