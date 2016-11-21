'use strict'

var fs = require('fs')
var Path = require('path')
var Rand = require('crypto-rand')
var Crypto = require('crypto-js')
var Database = require(Path.join(__base, 'src/database/client.js'))
var DB = {
  user: new Database('user', '127.0.0.1', __config.database.port, __DBtoken),
  invitation: new Database('invitation', '127.0.0.1', __config.database.port, __DBtoken)
}

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Auth'
})

function Auth () {
  var self = this
}

Auth.prototype.login = function (user, pass, cb) {
  var self = this
  var login = function(){

    DB.user.find({
      user: user,
      password: pass
    }, function(err, res){
      if(err){
        LogWorker.error(err)
        cb(false)
      } else {
        if(res <= 0){
          cb(false)
        } else {
          var token = self.genToken(user, pass)

          DB.user.update({
            user: user,
            password: pass
          }, {
            $set: {
              token: Crypto.SHA256(token).toString()
            }
          }, {}, function(err){
            if(err){
              LogWorker.error(err)
              cb(false)
            } else {
              LogWorker.info(`${user} login.`)
              cb(token)
            }
          })
        }
      }
    })
  }

  setTimeout(login)
}

Auth.prototype.logout = function (user, token, cb) {
  var self = this
  var logout = function(){

    DB.user.find({
      user: user,
      token: Crypto.SHA256(token).toString()
    }, function(err, res){
      if(err){
        LogWorker.error(err)
        cb(false)
      } else {
        if(res <= 0){
          cb(false)
        } else {

          DB.user.update({
            user: user,
            token: Crypto.SHA256(token).toString()
          }, {
            $unset: {
              token: Crypto.SHA256(token).toString()
            }
          }, {}, function(err){
            if(err){
              LogWorker.error(err)
              cb(false)
            } else {
              LogWorker.info(`${user} logout.`)
              cb(true)
            }
          })
        }
      }
    })
  }

  setTimeout(logout)
}

Auth.prototype.register = function (user, pass, invite, cb) {
  var self = this
  var register = function(){

    DB.invitation.find({hash: invite}, function(err, res){
      if(err){
        LogWorker.error(err)
        cb(false)
      } else {
        if(res.length <= 0){
          cb(false)
        } else {

          DB.user.find({user: user}, function(err, res){
            if(err){
              LogWorker.error(err)
              cb(false)
            } else {
              if(res.length > 0){
                cb(false)
              } else {

                DB.invitation.remove({hash: invite})
                var token = self.genToken(user, pass)

                DB.user.insert({
                  user: user,
                  password: pass,
                  token: Crypto.SHA256(token).toString()
                }, function(err){
                  if(err){
                    LogWorker.error(err)
                    cb(false)
                  } else {
                    LogWorker.info(`${user} register with invitation: ${invite}.`)
                    cb(token)
                  }
                })
              }
            }
          })
        }
      }
    })
  }

  setTimeout(register)
}

Auth.prototype.changePass = function (user, pass, newPass, cb) {
  var self = this
  var changePass = function(){

    DB.user.find({
      user: user,
      password: pass
    }, function(err, res){
      if(err){
        LogWorker.error(err)
        cb(false)
      } else {
        if(res.length <= 0){
          cb(false)
        } else {

          DB.user.update({
            user: user,
            password: pass
          }, {
            $set: {
              password: newPass
            }
          }, {}, function(err){
            if(err){
              LogWorker.error(err)
              cb(false)
            } else {
              cb(true)
            }
          })
        }
      }
    })
  }

  setTimeout(changePass)
}

Auth.prototype.checkLogged = function (user, token, cb) {
  var encryptedToken = Crypto.SHA256(token).toString()

  DB.user.find({
    user: user,
    token: Crypto.SHA256(token).toString()
  }, function(err, res){
    if(err){
      LogWorker.error(err)
      cb(false)
    } else {
      if(res.length <= 0){
        cb(false)
      } else {
        cb(true)
      }
    }
  })
}

Auth.prototype.genToken = function (user, pass) {
  var seed = `${user}${pass}${Rand.rand().toString()}`
  return Crypto.SHA256(seed).toString()
}

Auth.prototype.createInvite = function (inviteKey, cb) {
  var self = this
  var createInvite = function(){
    if (inviteKey === __config.server.invitationKey) {
      var invite = self.genToken(Rand.rand(), Rand.rand())

      DB.invitation.insert({hash: invite}, function(err){
        if(err){
          LogWorker.error(err)
          cb(false)
        } else {
          LogWorker.info(`Invite generated: ${invite}.`)
          cb(invite)
        }
      })
    } else {
      cb(false)
    }
  }

  setTimeout(createInvite)
}

Auth.prototype.deleteInvite = function (invite, cb) {
  var self = this

  var deleteInvite = function(){

    DB.invitation.remove({hash: invite}, function(err){
      if(err){
        LogWorker.error(err)
        cb(false)
      }
    })
  }

  setTimeout(deleteInvite)
}

module.exports = new Auth()
