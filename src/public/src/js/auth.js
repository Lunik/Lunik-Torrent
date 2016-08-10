var App = {}
;(function () {
  function _App () {
    var self = this
    requirejs.config({
      paths: {
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'crypto-js': '../bower_components/crypto-js/crypto-js',
        'vue': '../bower_components/vue/dist/vue.min',
        'notify-me': '../bower_components/notify.me/dist/js/notify-me'
      }
    })

    // load modules
    requirejs(['jquery', 'crypto-js', 'vue'], function (jq, crypto, vue) {
      self.Crypto = crypto
      self.Vue = vue
      self.v = new self.Vue({
        el: '.auth',
        data: {
          login: {
            state: true,
            user: '',
            pass: ''
          },
          register: {
            state: false,
            user: '',
            pass: '',
            pass2: ''
          },
          invite: {
            state: false
          },
          info: '',
          currentSubmit: 'login'
        }
      })

      // Init auth input
      $('input').blur(function() {
        // check if the input has any value (if we've typed into it)
        if ($(this).val()){
          $(this).addClass('used')
        } else{
          $(this).removeClass('used')
        }
      })

      // Trigger keydown event
      $(window).keydown(function (event) {
        switch (event.keyCode) {
          case 13:
            $('.auth .' + self.getCurrentSubmit() + ' button').trigger('click')
          break
        }
      })

      $('.auth .switch #login').click(function(){
        App.switch('login')
      })
      $('.auth .switch #register').click(function(){
        App.switch('register')
      })

      requirejs(['notify-me', 'format', 'loading'], function(notif){
        self.updateHash()

        $('.auth .login .submit').click(function(){
          var loginData = self.getLogin()
          if(loginData.user.length > 0 && loginData.pass.length){
             self.login(loginData.user, loginData.pass)
          } else {
            self.setInfo('User and Password are required.')
          }
        })

        $('.auth .register .submit').click(function(){
          var registerData = self.getRegister()
          if(App.hash){
            if(registerData.user.length > 0 && registerData.pass.length && registerData.pass2.length){
              if(registerData.pass === registerData.pass2){
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

        App.Loading.hide('app')
      })
    })
  }

  _App.prototype.updateHash = function() {
    var self = this
    self.hash = document.location.hash.substring(1)

    $(window).bind('hashchange', function () {
      self.hash = document.location.hash.substring(1)
    })
  }

  _App.prototype.getCurrentSubmit = function(){
    return this.v.$data.currentSubmit
  }
  _App.prototype.switch = function(to){
    this.v.$data.currentSubmit = to
    this.v.$data.login.state = (to === 'login')
    this.v.$data.register.state = (to === 'register' && App.hash)
    this.v.$data.invite.state = (to === 'invite' || (to === 'register' && !App.hash))
    this.v.$data.info = ''
  }

  _App.prototype.setInfo = function(info){
    this.v.$data.info = info
  }

  _App.prototype.getLogin = function(){
    return {
      user: this.v.$data.login.user,
      pass: App.Crypto.SHA256(this.v.$data.login.pass).toString()
    }
  }

  _App.prototype.getRegister = function(){
    return {
      user: this.v.$data.register.user,
      pass: App.Crypto.SHA256(this.v.$data.register.pass).toString(),
      pass2: App.Crypto.SHA256(this.v.$data.register.pass2).toString()
    }
  }

  _App.prototype.login = function(user, pass){
    App.Loading.show('action')
    $.ajax({
      type: 'post',
      url: '/auth?todo=login',
      timeout: 10000,
      data: {
        user: user,
        pass: pass
      },
      dataType: 'json',
      success: function(data){
        if (data.err) {
          $.notify.error({
            title: 'Error',
            text: data.err,
            duration: 10
          })
        } else {
          window.location = "/"
        }
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      console.log(err)
      App.Loading.hide('action')
      $.notify.error({
        title: 'Error in Auth.login()',
        text: err.statusText,
        duration: 5
      })
    })
  }

  _App.prototype.register = function(user, pass, invite){
    App.Loading.show('action')
    $.ajax({
      type: 'post',
      url: '/auth?todo=register',
      timeout: 10000,
      data: {
        user: user,
        pass: pass,
        invite: invite
      },
      dataType: 'json',
      success: function(data){
        if (data.err) {
          $.notify.error({
            title: 'Error',
            text: data.err,
            duration: 10
          })
        } else {
          window.location = "/"
        }
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      console.log(err)
      App.Loading.hide('action')
      $.notify.error({
        title: 'Error in Auth.register()',
        text: err.statusText,
        duration: 5
      })
    })
  }
  App = new _App()
})()
