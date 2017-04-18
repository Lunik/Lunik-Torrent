// Global variable to store all modules
var App

;(function () {
  function _App () {
    var self = this
    // Configure bower_components path
    requirejs.config({
      priority: ['jquery'],
      paths: {
        'localstorage': '../bower_components/local-storage-api/dist/storage.min',
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'jquery-ui': '../bower_components/jquery-ui/jquery-ui.min',
        'crypto-js': '../bower_components/crypto-js/crypto-js',
        'vue': '../bower_components/vue/dist/vue.min',
        'jquery.ui.touch-punch': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
        'notify-me': '../bower_components/notify.me/dist/js/notify-me',
        'popup': '../bower_components/popupjs/dist/popup.min',
        'clipboard': '../bower_components/clipboard/dist/clipboard.min',
        'snow': 'special-event/jquery.snow.min.1.0'
      },
      shim: {
        'crypto-js': [],
        'jquery.ui.touch-punch': ['jquery'],
        'snow': ['jquery'],
        'notify-me': ['jquery'],
        'popup': ['jquery'],
        'loading': ['jquery', 'vue'],
        'top-menu': ['jquery', 'vue'],
        'list': ['jquery', 'vue', 'notify-me', 'loading'],
        'mediainfo': ['jquery', 'vue', 'notify-me', 'loading', 'format', 'localstorage'],
        'searchtorrent': ['jquery', 'vue', 'popup', 'loading'],
        'directory': ['jquery', 'notify-me', 'loading', 'format', 'list', 'top-menu'],
        'torrent': ['jquery', 'notify-me', 'loading', 'format', 'list', 'top-menu'],
        'left-menu': ['jquery', 'vue', 'notify-me', 'list', 'top-menu', 'torrent', 'directory', 'localstorage'],
        'special-event': ['jquery', 'snow']
      }
    })

    // load modules
    requirejs([
      'vue',
      'localstorage',
      'jquery',
      'jquery-ui',
      'format',
      'clipboard',
      'crypto-js'
    ], function (v, ls, jq, jqui, f, Clip, crypto) {
      self.Vue = v
      self.Storage = new Storage()
      self.Clipboard = new Clip('.clip-but')
      self.Crypto = crypto
      /**
       * Get The index of an object into an array
       * @param {array} array - The array
       * @param {function} compFunc - Function to determine the object
      */
      $.indexOfO = function (array, compFunc) {
        for (var key in array) {
          if (compFunc(array[key])) {
            return key
          }
        }
        return -1
      }

      // load secondary modules
      // load app modules
      requirejs([
        'jquery.ui.touch-punch',
        'snow',
        'notify-me',
        'popup',
        'loading',
        'top-menu',
        'list',
        'mediainfo',
        'searchtorrent',
        'directory',
        'torrent',
        'left-menu',
        'special-event'
      ], function (jqui, snow, notif, pop, load, tm, l, mi, st, dir, tor, lm) {
        self.main()
      })
    })
  }

  _App.prototype.main = function () {
    var self = this
    // Get hash
    self.updateHash()

    // Start with directory
    self.Directory.getDir(function (dir) {
      self.Directory.append(dir)
    })
    self.Directory.setRefresh(true, 30000)

    // on hash change set hash and reload directory
    $(window).bind('hashchange', function () {
      $('.list .file').removeClass('selected')
      $('.list .torrent').removeClass('selected')

      self.updateHash()

      self.TopMenu.setActions({
        download: false,
        rename: false,
        remove: false,
        info: false
      })
      self.Directory.getDir(function (dir) {
        self.Directory.append(dir)
      })
    })

    // Trigger keydown event
    $(window).keydown(function (event) {
      switch (event.keyCode) {
        case 13:
          $(`.left-menu .action .${App.LeftMenu.vue.$data.currentAction}`).trigger('click')
          break
      }
    })

    // Everithing is loaded
    self.Loading.hide('app')

    // Logout

    $('body').on('click', '.top-menu .logout', function () {
      $.ajax({
        type: 'post',
        url: '/auth/logout',
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
        console.error(`Error in Config.logout() : ${err.statusText}`)
      })
    })
  }
  /**
   * Get directory array from hash
   * @return {array} - Array of directories
  */
  _App.prototype.getDirFromHash = function () {
    var dir = this.hash.split('/') || ''
    for (var i in dir) {
      if (dir[i] === '') {
        dir.splice(i, 1)
      }
    }
    return dir
  }

  _App.prototype.updateHash = function () {
    this.hash = document.location.hash.substring(1)
    if (this.hash[this.hash.length - 1] !== '/' && this.hash.length > 0) {
      this.hash += '/'
    }
  }
  // Global var with all the modules
  App = new _App()
})()
