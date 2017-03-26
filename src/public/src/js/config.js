;(function () {
  /**
   * Configuration manager
   * @constructor
  */
  class _Config {
    constructor () {
      this.config = {
        theme: 'default'
      }

      this.vuePopup = new App.Vue({
        el: '.popup .config-pop',
        data: {
          config: this.config
        }
      })

      this.setConfig(App.Storage.readData('config'))

      $('.parameter .button').on('click', () => {
        this.showConfig()
      })
      $('.config-pop .submit').on('click', () => { this.submit() })

    // Logout

      $('body').on('click', '.top-menu .logout', () => {
        $.ajax({
          type: 'post',
          url: '/auth/logout',
          data: {},
          dataType: 'json',
          success: (data) => {
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
        }).done(() => {
          App.Loading.hide('action')
        }).fail((err) => {
          App.Loading.hide('action')
          console.error(`Error in Config.logout() : ${err.statusText}`)
        })
      })
    }

  /**
   * Display the config popup
  */
    showConfig () {
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
    submit () {
      var config = {}
      this.setConfig(config)
      $.popupjs.remove()
    }

  /**
   * Set config and save it.
   * @param {object} config - Configuration.
  */
    setConfig (config) {
      if (config) {
        for (var key in config) {
          this.config[key] = config[key]
        }
        App.Storage.storeData('config', this.config)
      }
    }
}
  App.Config = new _Config()
})()
