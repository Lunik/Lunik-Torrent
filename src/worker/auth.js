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

Auth.prototype.login = function (user, pass) {
  if (typeof this.passwords[user] === 'undefined') {
    
    
    var token = this.genToken(user, pass)
    this.passwords[user] = {
      pass: pass,
      token: [Crypto.SHA256(token).toString()]
    }
    this.savePasswords()

    return token
  } else {
    return false
  }
  
  if (this.passwords[user] && this.passwords[user].pass === pass) {
    LogWorker.info(user + ' login.')
    if (typeof this.passwords[user].token === 'undefined') {
      this.passwords[user].token = []
    }
    var token = this.genToken(user, pass)
    this.passwords[user].token.push(Crypto.SHA256(token).toString())
    this.savePasswords()
    return token
  } else {
    return false
  }
}

Auth.prototype.logout = function (user, token) {
  LogWorker.info(user + ' logout.')
  var encryptedToken = Crypto.SHA256(token).toString()
  if (this.passwords[user] && this.passwords[user].token && this.passwords[user].token.indexOf(encryptedToken) !== -1) {
    delete this.passwords[user].token.splice(this.passwords[user].token.indexOf(encryptedToken), 1)
    return true
  } else {
    return false
  }
}

Auth.prototype.register = function (user, pass, invite) {
  if (this.invites.indexOf(invite) !== -1 && typeof this.passwords[user] === 'undefined') {
    LogWorker.info(user + ' register with invitation: ' + invite + '.')
    this.deleteInvite(invite)
    var token = this.genToken(user, pass)
    this.passwords[user] = {
      pass: pass,
      token: [Crypto.SHA256(token).toString()]
    }
    this.savePasswords()

    return token
  } else {
    return false
  }
}

Auth.prototype.changePass = function (user, pass, newPass) {
  if (this.passwords[user] && this.passwords[user].pass === pass) {
    LogWorker.info(user + ' change his password.')
    this.passwords[user].pass = newPass
    this.savePasswords()
    return true
  } else {
    return false
  }
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
  var seed = user + pass + Rand.rand().toString()
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

Auth.prototype.createInvite = function (inviteKey) {
  if (inviteKey === __config.server.invitationKey) {
    var invite = this.genToken(Rand.rand(), Rand.rand())
    LogWorker.info('Invite generated: ' + invite + '.')
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
