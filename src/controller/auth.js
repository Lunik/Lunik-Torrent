var Path = require('path')
var express = require('express')
var router = express.Router()

var Auth = require(Path.join(__base, 'src/worker/auth'))

router.use(function (req, res, next) {
  Auth.checkLogged(req.cookies.user, req.cookies.token, function (isLogged) {
    if (req.url === '/login.html' || req.url.match(/\/auth\/.*/g) || req.url.match(/\/src\/.*/g)) {
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
})

router.get('/auth', function (req, res) {
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

router.post('/auth/login', function (req, res) {
  var data = {
    user: req.body.user || req.cookies.user,
    pass: req.body.pass
  }
  if (data.user && data.pass) {
    Auth.login(data.user, data.pass, function (token) {
      if (token) {
        res.cookie('token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
        res.cookie('user', data.user, { expires: new Date(Date.now() + 86400000), httpOnly: true, encode: String })
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

router.post('/auth/logout', function (req, res) {
  var data = {
    user: req.body.user || req.cookies.user,
    token: req.body.token || req.cookies.token
  }
  if (data.user && data.token) {
    Auth.logout(data.user, data.token, function (loggedOut) {
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

router.post('/auth/register', function (req, res) {
  var data = {
    user: req.body.user || req.cookies.user,
    pass: req.body.pass,
    invite: req.body.invite
  }
  if (data.user && data.pass && data.invite) {
    Auth.register(data.user, data.pass, data.invite, function (token) {
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

router.get('/auth/invite', function (req, res) {
  var data = {
    invitationKey: req.query.invitationkey
  }
  if (data.invitationKey) {
    Auth.createInvite(data.invitationKey, function (invite) {
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

router.post('/auth/invite', function (req, res) {
  var data = {
    invitationKey: req.body.invitationkey
  }
  if (data.invitationKey) {
    Auth.createInvite(data.invitationKey, function (invite) {
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

router.post('/auth/changepass', function (req, res) {
  var data = {
    user: req.body.user || req.cookies.user,
    oldpass: req.body.oldpass,
    newPass: req.body.newpass
  }
  if (data.user && data.oldpass && data.newPass) {
    Auth.changePass(data.user, data.oldpass, data.newPass, function (passwordChanged) {
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
