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
    describe('GetInfo', function(){
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
})
