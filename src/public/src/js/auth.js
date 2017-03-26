var App = {}
;(function () {
  function _App () {
    var self = this
    requirejs.config({
      paths: {
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'crypto-js': '../bower_components/crypto-js/crypto-js',
        'vue': '../bower_components/vue/dist/vue.min',
        'notify-me': '../bower_components/notify.me/dist/js/notify-me'
      },
      shim: {
        'notify-me': ['jquery'],
        'loading': ['jquery', 'vue']
      }
    })

    // load modules
    requirejs([
      'jquery',
      'crypto-js',
      'vue'], function (jq, crypto, vue) {
      self.Crypto = crypto
      self.Vue = vue
      self.v = new self.Vue({
        el: '.auth',
        data: {
          login: {
            state: true,
            user: '',
            pass: '',
            staylogged: false
          },
          register: {
            state: false,
            user: '',
            pass: '',
            pass2: ''
          },
          changepass: {
            state: false,
            user: '',
            oldpass: '',
            newpass: '',
            newpass2: ''
          },
          invite: {
            state: false
          },
          info: '',
          currentSubmit: 'login'
        }
      })

      // Init auth input
      $('input').blur(function () {
        // check if the input has any value (if we've typed into it)
        if ($(this).val()) {
          $(this).addClass('used')
        } else {
          $(this).removeClass('used')
        }
      })

      // Trigger keydown event
      $(window).keydown(function (event) {
        switch (event.keyCode) {
          case 13:
            $(`.auth .${self.getCurrentSubmit()} button`).trigger('click')
            break
        }
      })

      $('.auth .switch #login').on('click', function () {
        App.switch('login')
      })
      $('.auth .switch #register').on('click', function () {
        App.switch('register')
      })
      $('.auth .switch #changepass').on('click', function () {
        App.switch('changepass')
      })

      requirejs([
        'notify-me',
        'format',
        'loading'], function (notif) {
        self.updateHash()

        $('.auth .login .submit').on('click', function () {
          var loginData = self.getLogin()
          if (loginData.user.length > 0 && loginData.pass.length) {
            self.login(loginData.user, loginData.pass, loginData.staylogged)
          } else {
            self.setInfo('User and Password are required.')
          }
        })

        $('.auth .register .submit').on('click', function () {
          var registerData = self.getRegister()
          if (App.hash) {
            if (registerData.user.length > 0 && registerData.pass.length && registerData.pass2.length) {
              if (registerData.pass === registerData.pass2) {
                self.register(registerData.user, registerData.pass, App.hash)
              } else {
                self.setInfo('The two Passwords must be identical.')
              }
            } else {
              self.setInfo('User and Password are required.')
            }
          } else {
            self.switch('invite')
          }
        })

        $('.auth .changepass .submit').on('click', function () {
          var changePassData = self.getChangePass()
          if (changePassData.user.length > 0 && changePassData.oldpass.length && changePassData.newpass.length && changePassData.newpass2.length) {
            if (changePassData.newpass === changePassData.newpass2) {
              if (changePassData.newpass !== changePassData.oldpass) {
                self.changePass(changePassData.user, changePassData.oldpass, changePassData.newpass)
              } else {
                self.setInfo('Same Password, nothing to change.')
              }
            } else {
              self.setInfo('The two Passwords must be identical.')
            }
          } else {
            self.setInfo('User, old Password and new Password are required.')
          }
        })

        $('.auth .invite input').keyup(function () {
          var code = $(this).val()
          if (code.length === 64) {
            document.location.hash = `#${code}`
          }
        })

        App.Loading.hide('app')
      })
    })
  }

  _App.prototype.updateHash = function () {
    var self = this
    self.hash = document.location.hash.substring(1)

    if (self.hash) {
      App.switch('register')
    }
    $(window).bind('hashchange', function () {
      self.hash = document.location.hash.substring(1)
      if (self.hash) {
        App.switch('register')
      }
    })
  }

  _App.prototype.getCurrentSubmit = function () {
    return this.v.$data.currentSubmit
  }
  _App.prototype.switch = function (to) {
    this.v.$data.currentSubmit = to
    this.v.$data.login.state = (to === 'login')
    this.v.$data.changepass.state = (to === 'changepass')
    this.v.$data.register.state = (to === 'register' && App.hash)
    this.v.$data.invite.state = (to === 'invite' || (to === 'register' && !App.hash))
    this.v.$data.info = ''
  }

  _App.prototype.setInfo = function (info) {
    this.v.$data.info = info
  }

  _App.prototype.cleanPassword = function () {
    this.v.$data.login.pass = ''
    this.v.$data.register.pass = ''
    this.v.$data.register.pass2 = ''
  }

  _App.prototype.getLogin = function () {
    return {
      user: this.v.$data.login.user.toLowerCase(),
      pass: App.Crypto.SHA256(this.v.$data.login.pass).toString(),
      staylogged: this.v.$data.login.staylogged
    }
  }

  _App.prototype.getRegister = function () {
    return {
      user: this.v.$data.register.user.toLowerCase(),
      pass: App.Crypto.SHA256(this.v.$data.register.pass).toString(),
      pass2: App.Crypto.SHA256(this.v.$data.register.pass2).toString()
    }
  }

  _App.prototype.getChangePass = function () {
    return {
      user: this.v.$data.changepass.user.toLowerCase(),
      oldpass: App.Crypto.SHA256(this.v.$data.changepass.oldpass).toString(),
      newpass: App.Crypto.SHA256(this.v.$data.changepass.newpass).toString(),
      newpass2: App.Crypto.SHA256(this.v.$data.changepass.newpass2).toString()
    }
  }

  _App.prototype.login = function (user, pass, staylogged) {
    App.Loading.show('action')
    $.ajax({
      type: 'post',
      url: '/auth/login',
      data: {
        user: user,
        pass: pass,
        staylogged: staylogged
      },
      dataType: 'json',
      success: function (data) {
        if (data.err) {
          App.cleanPassword()
          $.notify.error({
            title: 'Error',
            text: data.err,
            duration: 10
          })
        } else {
          $.notify.success({
            title: 'Login',
            text: 'Successfully logged in.'
          })
          window.location = '/'
        }
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      App.Loading.hide('action')
      console.error(`Error in Auth.login() : ${err.statusText}`)
    })
  }

  _App.prototype.register = function (user, pass, invite) {
    App.Loading.show('action')
    $.ajax({
      type: 'post',
      url: '/auth/register',
      data: {
        user: user,
        pass: pass,
        invite: invite
      },
      dataType: 'json',
      success: function (data) {
        if (data.err) {
          App.cleanPassword()
          $.notify.error({
            title: 'Error',
            text: data.err,
            duration: 10
          })
        } else {
          $.notify.success({
            title: 'Login',
            text: 'Successfully Signed in.'
          })
          window.location = '/'
        }
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      App.Loading.hide('action')
      console.error(`Error in Auth.register() : ${err.statusText}`)
    })
  }

  _App.prototype.changePass = function (user, oldpass, newpass) {
    var self = this
    App.Loading.show('action')
    $.ajax({
      type: 'post',
      url: '/auth/changepass',
      data: {
        user: user,
        oldpass: oldpass,
        newpass: newpass
      },
      dataType: 'json',
      success: function (data) {
        if (data.err) {
          App.cleanPassword()
          $.notify.error({
            title: 'Error',
            text: data.err,
            duration: 10
          })
        } else {
          $.notify.success({
            title: 'Change Password',
            text: 'Successfully change Password.'
          })
          self.switch('login')
        }
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      App.Loading.hide('action')
      console.error(`Error in Auth.changePass() : ${err.statusText}`)
    })
  }
  App = new _App()
})()
