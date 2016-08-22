'use strict'

var fs = require('fs')
var Path = require('path')
var Rand = require('crypto-rand')
var Crypto = require('crypto-js')
var Etcd = require('etcd-node/src/client')
var EtcdClient = new Etcd({
  host: __config.etcd.host,
  port: __config.etcd.port
})

var Log = require(Path.join(__base, 'src/worker/log.js'))

function Auth () {
  this.passwords = require(Path.join(__base, 'data/passwords.json'))
  this.invites = []
}

Auth.prototype.login = function (user, pass, cb) {
  var self = this
  EtcdClient.get('passwords.'+user+'.pass', function(data){
    if(data.code === 200){
      var token = self.genToken(user, pass)
      EtcdClient.add('passwords.'+user+'.token', token, function(data){
        if(data.code === 200){
          Log.print(user + ' login.')
          cb(token)
        } else {
          cb(false)
        }
      })
    } else {
      cb(false)
    }
  })
}

Auth.prototype.logout = function (user, token, cb) {
  var self = this
  EtcdClient.get('passwords.'+user+'.token', function(data){
    if(data.code === 200){
      if(data.data.value.indexOf(token) !== -1){
        let tokens = data.data.value
        tokens.splice(data.data.value.indexOf(token), 1)
        if(tokens.length > 0){
          EtcdClient.set('passwords.'+user+'.token', data.data.value, function(data){
            if(data.code === 200){
              cb(true)
            } else {
              cb(false)
            }
          })
        } else {
          EtcdClient.delete('passwords.'+user+'.token', function(data){
            if(data.code === 200){
              cb(true)
            } else {
              cb(false)
            }
          })
        }
      } else {
        cb(false)
      }
    } else {
      cb(false)
    }
  })
  Log.print(user + ' logout.')
  if (this.passwords[user] && this.passwords[user].token && this.passwords[user].token.indexOf(token) !== -1) {
    delete this.passwords[user].token.splice(this.passwords[user].token.indexOf(token), 1)
    return true
  } else {
    return false
  }
}

Auth.prototype.register = function (user, pass, invite, cb) {
  var self = this
  EtcdClient.get('passwords.'+user+'.pass', function(data){
    if(self.invites.indexOf(invite) !== -1 && data.code === 204){
      self.deleteInvite(invite)
      var token = self.genToken(user, pass)
      EtcdClient.set('passwords.'+user+'.pass', pass, function(data){
        if(data.code === 200){
          EtcdClient.set('passwords.'+user+'.token', [token], function(data){
            if(data.code === 200){
              Log.print(user + ' register with invitation: ' + invite + '.')
              cb(token)
            } else {
              cb(false)
            }
          })
        } else {
          cd(false)
        }
      })
    } else {
      cb(false)
    }
  })
}

Auth.prototype.checkLogged = function (user, token, cb) {
  EtcdClient.get('passwords.'+user+'.token', function(data){
    if(data.code === 200){
      cb(data.data.value.indexOf(token) !== -1)
    } else {
      cb(false)
    }
  })
}

Auth.prototype.genToken = function (user, pass) {
  var seed = user + pass + Rand.rand().toString()
  return Crypto.SHA256(seed).toString()
}


Auth.prototype.createInvite = function (inviteKey) {
  if (inviteKey === __config.server.invitationKey) {
    var invite = this.genToken(Rand.rand(), Rand.rand())
    Log.print('Invite generated: ' + invite + '.')
    this.invites.push(invite)
    return invite
  } else {
    return false
  }
}

Auth.prototype.deleteInvite = function (invite) {
  var index = this.invites.indexOf(invite)
  if (index !== -1) {
    this.invites.splice(index, 1)
  }
  return true
}

module.exports = new Auth()
