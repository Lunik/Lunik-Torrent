var App = {}
;(function () {
  class _App {
    constructor () {
      requirejs.config({
        paths: {
          'jquery': '../lib/jquery/dist/jquery.min',
          'crypto-js': '../lib/crypto-js/crypto-js',
          'vue': '../lib/vue/dist/vue.min',
          'notify-me': '../lib/notify.me/dist/js/notify-me'
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
        'vue'], (jq, crypto, vue) => {
        this.Crypto = crypto
        this.Vue = vue
        this.v = new this.Vue({
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
        $('input').blur((e) => {
        // check if the input has any value (if we've typed into it)
          if ($(e.currentTarget).val()) {
            $(e.currentTarget).addClass('used')
          } else {
            $(e.currentTarget).removeClass('used')
          }
        })

      // Trigger keydown event
        $(window).keydown((event) => {
          switch (event.keyCode) {
            case 13:
              $(`.auth .${this.getCurrentSubmit()} button`).trigger('click')
              break
          }
        })

        $('.auth .switch #login').on('click', () => {
          App.switch('login')
        })
        $('.auth .switch #register').on('click', () => {
          App.switch('register')
        })
        $('.auth .switch #changepass').on('click', () => {
          App.switch('changepass')
        })

        requirejs([
          'notify-me',
          'format',
          'loading'], (notif) => {
          this.updateHash()

          $('.auth .login .submit').on('click', () => {
            var loginData = this.getLogin()
            if (loginData.user.length > 0 && loginData.pass.length) {
              this.login(loginData.user, loginData.pass, loginData.staylogged)
            } else {
              this.setInfo('User and Password are required.')
            }
          })

          $('.auth .register .submit').on('click', () => {
            var registerData = this.getRegister()
            if (App.hash) {
              if (registerData.user.length > 0 && registerData.pass.length && registerData.pass2.length) {
                if (registerData.pass === registerData.pass2) {
                  this.register(registerData.user, registerData.pass, App.hash)
                } else {
                  this.setInfo('The two Passwords must be identical.')
                }
              } else {
                this.setInfo('User and Password are required.')
              }
            } else {
              this.switch('invite')
            }
          })

          $('.auth .changepass .submit').on('click', () => {
            var changePassData = this.getChangePass()
            if (changePassData.user.length > 0 && changePassData.oldpass.length && changePassData.newpass.length && changePassData.newpass2.length) {
              if (changePassData.newpass === changePassData.newpass2) {
                if (changePassData.newpass !== changePassData.oldpass) {
                  this.changePass(changePassData.user, changePassData.oldpass, changePassData.newpass)
                } else {
                  this.setInfo('Same Password, nothing to change.')
                }
              } else {
                this.setInfo('The two Passwords must be identical.')
              }
            } else {
              this.setInfo('User, old Password and new Password are required.')
            }
          })

          $('.auth .invite input').keyup((e) => {
            var code = $(e.currentTarget).val()
            if (code.length === 64) {
              document.location.hash = `#${code}`
            }
          })

          App.Loading.hide('app')
        })
      })
    }

    updateHash () {
      this.hash = document.location.hash.substring(1)

      if (this.hash) {
        App.switch('register')
      }
      $(window).bind('hashchange', () => {
        this.hash = document.location.hash.substring(1)
        if (this.hash) {
          App.switch('register')
        }
      })
    }

    getCurrentSubmit () {
      return this.v.$data.currentSubmit
    }
    switch (to) {
      this.v.$data.currentSubmit = to
      this.v.$data.login.state = (to === 'login')
      this.v.$data.changepass.state = (to === 'changepass')
      this.v.$data.register.state = (to === 'register' && App.hash)
      this.v.$data.invite.state = (to === 'invite' || (to === 'register' && !App.hash))
      this.v.$data.info = ''
    }

    setInfo (info) {
      this.v.$data.info = info
    }

    cleanPassword () {
      this.v.$data.login.pass = ''
      this.v.$data.register.pass = ''
      this.v.$data.register.pass2 = ''
    }

    getLogin () {
      return {
        user: this.v.$data.login.user.toLowerCase(),
        pass: App.Crypto.SHA256(this.v.$data.login.pass).toString(),
        staylogged: this.v.$data.login.staylogged
      }
    }

    getRegister () {
      return {
        user: this.v.$data.register.user.toLowerCase(),
        pass: App.Crypto.SHA256(this.v.$data.register.pass).toString(),
        pass2: App.Crypto.SHA256(this.v.$data.register.pass2).toString()
      }
    }

    getChangePass () {
      return {
        user: this.v.$data.changepass.user.toLowerCase(),
        oldpass: App.Crypto.SHA256(this.v.$data.changepass.oldpass).toString(),
        newpass: App.Crypto.SHA256(this.v.$data.changepass.newpass).toString(),
        newpass2: App.Crypto.SHA256(this.v.$data.changepass.newpass2).toString()
      }
    }

    login (user, pass, staylogged) {
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
        success: (data) => {
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
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error in Auth.login() : ${err.statusText}`)
      })
    }

    register (user, pass, invite) {
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
        success: (data) => {
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
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error in Auth.register() : ${err.statusText}`)
      })
    }

    changePass (user, oldpass, newpass) {
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
        success: (data) => {
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
            this.switch('login')
          }
        }
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error in Auth.changePass() : ${err.statusText}`)
      })
    }
}
  App = new _App()
})()
