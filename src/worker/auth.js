'use strict'

var fs = require('fs')
var Path = require('path')
var Rand = require('crypto-rand')
var Crypto = require('crypto-js')
var Database = require(Path.join(__base, 'src/database/client.js'))
var DB = {
  user: new Database('user', __config.database.host, __config.database.port, __DBtoken),
  invitation: new Database('invitation', __config.database.host, __config.database.port, __DBtoken),
  token: new Database('token', __config.database.host, __config.database.port, __DBtoken)
}

var Log = require(Path.join(__base, 'src/worker/log.js'))
var LogWorker = new Log({
  module: 'Auth'
})

function Auth () {
  var self = this

  setInterval(self.cleanToken, 60000)
}

Auth.prototype.login = function (user, pass, ip, cb) {
  var self = this
  var login = function () {
    DB.user.find({
      user: user,
      password: pass
    }, function (err, res) {
      if (err) {
        LogWorker.error(err)
        cb(false)
      } else {
        if (res <= 0) {
          cb(false)
        } else {
          self.genUserToken(user, pass, function (token) {
            LogWorker.info(`${user} login from ${ip}.`)
            cb(token)
          })
        }
      }
    })
  }

  setTimeout(login)
}

Auth.prototype.logout = function (user, token, cb) {
  var self = this
  var logout = function () {
    DB.token.find({
      user: user,
      token: Crypto.SHA256(token).toString()
    }, function (err, res) {
      if (err) {
        LogWorker.error(err)
        cb(false)
      } else {
        if (res <= 0) {
          cb(false)
        } else {
          console.log('plop')
          DB.token.remove({
            user: user,
            token: Crypto.SHA256(token).toString()
          }, {}, function (err) {
            console.log('plop')
            if (err) {
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
  var register = function () {
    DB.invitation.find({hash: invite}, function (err, res) {
      if (err) {
        LogWorker.error(err)
        cb(false)
      } else {
        if (res.length <= 0) {
          cb(false)
        } else {
          DB.user.find({user: user}, function (err, res) {
            if (err) {
              LogWorker.error(err)
              cb(false)
            } else {
              if (res.length > 0) {
                cb(false)
              } else {
                self.genUserToken(user, pass, function (token) {
                  DB.user.insert({
                    user: user,
                    password: pass
                  }, function (err) {
                    if (err) {
                      LogWorker.error(err)
                      cb(false)
                    } else {
                      LogWorker.info(`${user} register with invitation: ${invite}.`)
                      cb(token)
                      self.deleteInvite(invite)
                    }
                  })
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
  var changePass = function () {
    DB.user.find({
      user: user,
      password: pass
    }, function (err, res) {
      if (err) {
        LogWorker.error(err)
        cb(false)
      } else {
        if (res.length <= 0) {
          cb(false)
        } else {
          DB.user.update({
            user: user,
            password: pass
          }, {
            $set: {
              password: newPass
            }
          }, {}, function (err) {
            if (err) {
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

  DB.token.find({
    user: user,
    token: Crypto.SHA256(token).toString()
  }, function (err, res) {
    if (err) {
      LogWorker.error(err)
      cb(false)
    } else {
      if (res.length <= 0) {
        cb(false)
      } else {
        cb(true)
      }
    }
  })
}

Auth.prototype.genUserToken = function (user, pass, cb) {
  var self = this
  var seed = `${user}${pass}${Rand.rand().toString()}`
  var token = Crypto.SHA256(seed).toString()
  DB.token.insert({
    user: user,
    token: Crypto.SHA256(token).toString(),
    creation: Date.now(),
    'out-of-date': (new Date(Date.now() + 86400000)).getTime()
  }, function (err) {
    if (err) {
      LogWorker.error(err)
      cb(false)
    } else {
      cb(token)
    }
  })
}

Auth.prototype.cleanToken = function () {
  DB.token.remove({
    'out-of-date': {
      $lte: (new Date()).getTime()
    }
  }, { multi: true }, function (err) {
    if (err) {
      LogWorker.error(err)
    }
  })
}

Auth.prototype.genInvitation = function (seed1, seed2) {
  var seed = `${seed1}${seed2}${Rand.rand().toString()}`
  return Crypto.SHA256(seed).toString()
}

Auth.prototype.createInvite = function (masterKey, cb) {
  var self = this
  var createInvite = function () {
    if (masterKey === __config.server.masterKey) {
      var invite = self.genInvitation(Rand.rand(), Rand.rand())

      DB.invitation.insert({hash: invite}, function (err) {
        if (err) {
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

  var deleteInvite = function () {
    DB.invitation.remove({hash: invite}, function (err) {
      if (err) {
        LogWorker.error(err)
        cb(false)
      }
    })
  }

  setTimeout(deleteInvite)
}

Auth.prototype.lastSeen = function (user, cb) {
  DB.token.find({
    user: user
  }, function (err, tokens) {
    if (err) {
      LogWorker.error(err)
      cb(false)
    } else {
      cb(Math.max.apply(Math, tokens.map(function (token) {
        return isNaN(token.creation) ? 0 : token.creation
      })))
    }
  })
}
module.exports = new Auth()
