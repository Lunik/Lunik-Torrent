var Path = require('path')
var express = require('express')
var router = express.Router()

var Auth = require(Path.join(__workingDir, 'worker/auth'))

router.use((req, res, next) => {
  if (req.url.match(/\/auth\/.*/g) || req.url.match(/\/src\/.*/g)) {
    next()
  } else {
    Auth.checkLogged(req.cookies.user, req.cookies.token, (isLogged) => {
      if (req.url === '/login.html') {
        if (req.url === '/login.html' && req.cookies && isLogged) {
          res.redirect('/')
        } else {
          next()
        }
      } else {
        if (req.cookies && isLogged) {
          next()
        } else {
          res.redirect('/login.html')
        }
      }
    })
  }
})

router.get('/auth', (req, res) => {
  res.end(JSON.stringify({
    POST: [
      'login',
      'logout',
      'register',
      'invite',
      'changepass'
    ]
  }))
})

router.post('/auth/login', (req, res) => {
  var data = {
    user: req.body.user || req.cookies.user,
    pass: req.body.pass,
    staylogged: req.body.staylogged
  }
  if (data.user && data.pass) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    var cookieExpire = 86400000 // One day
    if (data.staylogged) {
      cookieExpire = 31536000000 // One year
    }
    Auth.login(data.user, data.pass, ip, cookieExpire, (token) => {
      if (token) {
        res.cookie('token', token, { expires: new Date(Date.now() + cookieExpire), httpOnly: true, encode: String })
        res.cookie('user', data.user, { expires: new Date(Date.now() + cookieExpire), httpOnly: true, encode: String })
        res.end(JSON.stringify({
          err: false,
          token: token
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Wrong User or Pass.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Missing User or Pass.'
    }))
  }
})

router.post('/auth/logout', (req, res) => {
  var data = {
    user: req.body.user || req.cookies.user,
    token: req.body.token || req.cookies.token
  }
  if (data.user && data.token) {
    Auth.logout(data.user, data.token, (loggedOut) => {
      if (loggedOut) {
        res.end(JSON.stringify({
          err: false
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Wrong User or Token.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Missing User or Token.'
    }))
  }
})

router.post('/auth/register', (req, res) => {
  var data = {
    user: req.body.user || req.cookies.user,
    pass: req.body.pass,
    invite: req.body.invite
  }
  if (data.user && data.pass && data.invite) {
    Auth.register(data.user, data.pass, data.invite, (token) => {
      if (token) {
        res.cookie('token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
        res.cookie('user', data.user, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
        res.end(JSON.stringify({
          err: false,
          token: token
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Wrong User, Pass or Invitation code.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Missing User, Pass or Invitation code.'
    }))
  }
})

router.get('/auth/invite', (req, res) => {
  var data = {
    masterKey: req.query.masterKey
  }
  if (data.masterKey) {
    Auth.createInvite(data.masterKey, (invite) => {
      if (invite) {
        res.end(JSON.stringify({
          err: false,
          invitationCode: invite
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Wrong Invitation Key.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Missing Invitation Key.'
    }))
  }
})

router.post('/auth/invite', (req, res) => {
  var data = {
    masterKey: req.body.masterKey
  }
  if (data.masterKey) {
    Auth.createInvite(data.masterKey, (invite) => {
      if (invite) {
        res.end(JSON.stringify({
          err: false,
          invitationCode: invite
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Wrong Invitation Key.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Missing Invitation Key.'
    }))
  }
})

router.post('/auth/changepass', (req, res) => {
  var data = {
    user: req.body.user || req.cookies.user,
    oldpass: req.body.oldpass,
    newPass: req.body.newpass
  }
  if (data.user && data.oldpass && data.newPass) {
    Auth.changePass(data.user, data.oldpass, data.newPass, (passwordChanged) => {
      if (passwordChanged) {
        res.end(JSON.stringify({
          err: false
        }))
      } else {
        res.end(JSON.stringify({
          err: 'Wrong User or Pass.'
        }))
      }
    })
  } else {
    res.end(JSON.stringify({
      err: 'Missing User, Pass or new Pass.'
    }))
  }
})

module.exports = router
