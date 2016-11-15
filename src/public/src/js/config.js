;(function () {
  /**
   * Configuration manager
   * @constructor
  */
  function _Config () {
    var self = this
    this.config = {
      theme: 'default'
    }

    this.vuePopup = new App.Vue({
      el: '.popup .config-pop',
      data: {
        config: self.config
      }
    })

    this.setConfig(App.Storage.readData('config'))

    $('.parameter .button').click(function () {
      self.showConfig()
    })
    $('.config-pop .submit').click(function () { self.submit() })

    // Logout

    $('body .top-menu .logout').click(function () {
      $.ajax({
        type: 'post',
        url: '/auth?todo=logout',
        data: {},
        dataType: 'json',
        success: function (data) {
          if (data.err) {
            $.notify.error({
              title: 'Error',
              text: data.err,
              duration: 10
            })
          } else {
            $.notify.success({
              title: 'Logout',
              text: 'Successfully logged out.'
            })
            window.location = '/login.html'
          }
        }
      }).done(function () {
        App.Loading.hide('action')
      }).fail(function (err) {
        App.Loading.hide('action')
        console.error(`Error in Config.logout() : ${err.statusText}`);
      })
    })
  }

  /**
   * Display the config popup
  */
  _Config.prototype.showConfig = function () {
    $.popupjs.init({
      pos: {
        x: null,
        y: '5%'
      },
      width: '90%',
      height: '90%',
      title: 'Configuration',
      html: $('.popup .config-pop'),
      closeBut: true
    })
    $.popupjs.draw()
  }

  /**
   * Submit config form.
  */
  _Config.prototype.submit = function () {
    var config = {}
    this.setConfig(config)
    $.popupjs.remove()
  }

  /**
   * Set config and save it.
   * @param {object} config - Configuration.
  */
  _Config.prototype.setConfig = function (config) {
    if (config) {
      for (var key in config) {
        this.config[key] = config[key]
      }
      App.Storage.storeData('config', this.config)
    }
  }
  App.Config = new _Config()
})()
