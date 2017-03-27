'use strict'

var Path = require('path')
var Rand = require('crypto-rand')
var Crypto = require('crypto-js')

var Database = require(Path.join(__workingDir, 'database/client.js'))
var DB = {
  user: new Database('user', __config.database.host, __config.database.port, __DBtoken),
  invitation: new Database('invitation', __config.database.host, __config.database.port, __DBtoken),
  token: new Database('token', __config.database.host, __config.database.port, __DBtoken)
}

var Log = require(Path.join(__workingDir, 'worker/log.js'))
var LogWorker = new Log({
  module: 'Auth'
})

class Auth {
  constructor () {
    setInterval(this.cleanToken, 60000)
  }

  login (user, pass, ip, cookieExpire, cb) {
    var login = () => {
      DB.user.find({
        user: user,
        password: pass
      }, (err, res) => {
        if (err) {
          LogWorker.error(err)
          cb(false)
        } else {
          if (res <= 0) {
            cb(false)
          } else {
            this.genUserToken(user, pass, cookieExpire, (token) => {
              LogWorker.info(`${user} login from ${ip}.`)
              cb(token)
            })
          }
        }
      })
    }

    setTimeout(login)
  }

  logout (user, token, cb) {
    var logout = () => {
      DB.token.find({
        user: user,
        token: Crypto.SHA256(token).toString()
      }, (err, res) => {
        if (err) {
          LogWorker.error(err)
          cb(false)
        } else {
          if (res <= 0) {
            cb(false)
          } else {
            DB.token.remove({
              user: user,
              token: Crypto.SHA256(token).toString()
            }, {}, (err) => {
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

  register (user, pass, invite, cb) {
    var register = () => {
      DB.invitation.find({hash: invite}, (err, res) => {
        if (err) {
          LogWorker.error(err)
          cb(false)
        } else {
          if (res.length <= 0) {
            cb(false)
          } else {
            DB.user.find({user: user}, (err, res) => {
              if (err) {
                LogWorker.error(err)
                cb(false)
              } else {
                if (res.length > 0) {
                  cb(false)
                } else {
                  this.genUserToken(user, pass, 86400000, (token) => {
                    DB.user.insert({
                      user: user,
                      password: pass
                    }, (err) => {
                      if (err) {
                        LogWorker.error(err)
                        cb(false)
                      } else {
                        LogWorker.info(`${user} register with invitation: ${invite}.`)
                        cb(token)
                        this.deleteInvite(invite)
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

  changePass (user, pass, newPass, cb) {
    var changePass = () => {
      DB.user.find({
        user: user,
        password: pass
      }, (err, res) => {
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
            }, {}, (err) => {
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

  checkLogged (user, token, cb) {
    var encryptedToken = Crypto.SHA256(token).toString()

    DB.token.find({
      user: user,
      token: encryptedToken
    }, (err, res) => {
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

  genUserToken (user, pass, cookieExpire, cb) {
    var seed = `${user}${pass}${Rand.rand().toString()}`
    var token = Crypto.SHA256(seed).toString()
    DB.token.insert({
      user: user,
      token: Crypto.SHA256(token).toString(),
      creation: Date.now(),
      'out-of-date': (new Date(Date.now() + cookieExpire)).getTime()
    }, (err) => {
      if (err) {
        LogWorker.error(err)
        cb(false)
      } else {
        cb(token)
      }
    })
  }

  cleanToken () {
    DB.token.remove({
      'out-of-date': {
        $lte: (new Date()).getTime()
      }
    }, { multi: true }, (err) => {
      if (err) {
        LogWorker.error(err)
      }
    })
  }

  genInvitation (seed1, seed2) {
    var seed = `${seed1}${seed2}${Rand.rand().toString()}`
    return Crypto.SHA256(seed).toString()
  }

  createInvite (masterKey, cb) {
    var createInvite = () => {
      if (masterKey === __config.server.masterKey) {
        var invite = this.genInvitation(Rand.rand(), Rand.rand())

        DB.invitation.insert({hash: invite}, (err) => {
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

  deleteInvite (invite, cb) {
    var deleteInvite = () => {
      DB.invitation.remove({hash: invite}, (err) => {
        if (err) {
          LogWorker.error(err)
          cb(false)
        }
      })
    }

    setTimeout(deleteInvite)
  }

  lastSeen (user, cb) {
    DB.token.find({
      user: user
    }, (err, tokens) => {
      if (err) {
        LogWorker.error(err)
        cb(false)
      } else {
        cb(Math.max.apply(Math, tokens.map((token) => {
          return isNaN(token.creation) ? 0 : token.creation
        })))
      }
    })
  }
}
module.exports = new Auth()
