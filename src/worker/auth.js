'use strict'

var fs = require('fs')
var Path = require('path')
var Rand = require('crypto-rand')
var Crypto = require('crypto-js')

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Auth'
})

function Auth () {
  this.passwords = require(Path.join(__base, 'data/passwords.json'))
  this.invites = []
}

Auth.prototype.login = function (user, pass, cb) {
  var self = this
  var login = function(user, pass){
    if (self.passwords[user] && self.passwords[user].pass === pass) {
      LogWorker.info(`${user} login.`)
      if (typeof self.passwords[user].token === 'undefined') {
        self.passwords[user].token = []
      }
      var token = self.genToken(user, pass)
      self.passwords[user].token.push(Crypto.SHA256(token).toString())
      var length = self.passwords[user].token.length
      if (length > 10) {
        self.passwords[user].token = self.passwords[user].token.slice(length - 10, length);
      }
      self.savePasswords()
      return token
    } else {
      return false
    }
  }

  cb(login(user, pass))
}

Auth.prototype.logout = function (user, token, cb) {
  var self = this
  var logout = function(user, token){
    LogWorker.info(`${user} logout.`)
    var encryptedToken = Crypto.SHA256(token).toString()
    if (self.passwords[user] && self.passwords[user].token && self.passwords[user].token.indexOf(encryptedToken) !== -1) {
      delete self.passwords[user].token.splice(self.passwords[user].token.indexOf(encryptedToken), 1)
      return true
    } else {
      return false
    }
  }
  cb(logout(user, token))
}

Auth.prototype.register = function (user, pass, invite, cb) {
  var self = this
  var register = function(user, pass, invite){
    if (self.invites.indexOf(invite) !== -1 && typeof self.passwords[user] === 'undefined') {
      LogWorker.info(`${user} register with invitation: ${invite}.`)
      self.deleteInvite(invite)
      var token = self.genToken(user, pass)
      self.passwords[user] = {
        pass: pass,
        token: [Crypto.SHA256(token).toString()]
      }
      self.savePasswords()

      return token
    } else {
      return false
    }
  }

  cb(register(user, pass, invite))
}

Auth.prototype.changePass = function (user, pass, newPass, cb) {
  var self = this
  var changePass = function(user, pass, newPass){
    if (self.passwords[user] && self.passwords[user].pass === pass) {
      LogWorker.info(`${user} change his password.`)
      self.passwords[user].pass = newPass
      self.savePasswords()
      return true
    } else {
      return false
    }
  }

  cb(changePass(user, pass, newPass))
}

Auth.prototype.checkLogged = function (user, token) {
  var encryptedToken = Crypto.SHA256(token).toString()
  if (this.passwords[user] && this.passwords[user].token && this.passwords[user].token.indexOf(encryptedToken) !== -1) {
    return true
  } else {
    return false
  }
}

Auth.prototype.genToken = function (user, pass) {
  var seed = `${user}${pass}${Rand.rand().toString()}`
  return Crypto.SHA256(seed).toString()
}

/**
 * Save passwords.fileInfo into data/fileInfo.json.
*/
Auth.prototype.savePasswords = function () {
  var self = this
  var passwords = JSON.parse(JSON.stringify(self.passwords))
  fs.writeFile('data/passwords.json', JSON.stringify(passwords), function (err) {
    if (err) {
      LogWorker.error(err)
      return
    }
  })
}

Auth.prototype.createInvite = function (inviteKey, cb) {
  var self = this
  var createInvite = function(inviteKey){
    if (inviteKey === __config.server.invitationKey) {
      var invite = self.genToken(Rand.rand(), Rand.rand())
      LogWorker.info(`Invite generated: ${invite}.`)
      self.invites.push(invite)
      return invite
    } else {
      return false
    }
  }

  cb(createInvite(inviteKey))
}

Auth.prototype.deleteInvite = function (invite) {
  var index = this.invites.indexOf(invite)
  if (index !== -1) {
    this.invites.splice(index, 1)
  }
  return true
}

module.exports = new Auth()
