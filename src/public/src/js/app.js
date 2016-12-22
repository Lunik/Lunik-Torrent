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
        'vue': '../bower_components/vue/dist/vue.min',
        'jquery.ui.touch-punch': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
        'notify-me': '../bower_components/notify.me/dist/js/notify-me',
        'popup': '../bower_components/popupjs/dist/popup.min',
        'clipboard': '../bower_components/clipboard/dist/clipboard.min',
        'snow': 'special-event/jquery.snow.min.1.0'
      },
      shim: {
        'jquery.ui.touch-punch': ['jquery'],
        'snow': ['jquery'],
        'notify-me': ['jquery'],
        'popup': ['jquery'],
        'loading': ['jquery', 'vue'],
        'top-menu': ['jquery', 'vue'],
        'config': ['jquery', 'vue', 'notify-me', 'localstorage'],
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
      'clipboard'
    ], function (v, ls, jq, jqui, f, clip) {
      self.Vue = v
      self.Storage = new Storage()
      self.Clipboard = new clip('.clip-but')
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
        'config',
        'list',
        'mediainfo',
        'searchtorrent',
        'directory',
        'torrent',
        'left-menu',
        'special-event'
      ], function (jqui, snow, notif, pop, load, tm, conf, l, mi, st, dir, tor, lm) {
        // Get hash
        self.hash = document.location.hash.substring(1)
        if (self.hash[self.hash.length - 1] !== '/' && self.hash.length > 0) {
          self.hash += '/'
        }

        // Start with directory
        self.Directory.getDir(function (dir) {
          self.Directory.append(dir)
        })
        self.Directory.setRefresh(true, 30000)

        // on hash change set hash and reload directory
        $(window).bind('hashchange', function () {
          $('.list .file').removeClass('selected')
          $('.list .torrent').removeClass('selected')

          self.hash = document.location.hash.substring(1)
          if (self.hash[self.hash.length - 1] !== '/' && self.hash.length > 0) {
            self.hash += '/'
          }

          App.TopMenu.setActions({
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

        $.popupjs.init({
          pos: {
            x: null,
            y: '5%'
          },
          width: '90%',
          height: '90%',
          title: 'Demo',
          html: $('<div>').addClass('demo-pop').append(
            $('<p>').css('margin-top', '50px').css('font-size', '20px').html(`This is a demo version of <a href="https://github.com/Lunik/Lunik-Torrent" style="color: #f7a253; font-size: 20px;">Lunik-Torrent</a><br>
            See <a href="https://github.com/Lunik/Lunik-Torrent" style="color: #f7a253; font-size: 20px;">here</a> for more informations about how installing this app yourself ! :)`)
          ),
          closeBut: true
        })
        $.popupjs.draw()

        // Everithing is loaded
        self.Loading.hide('app')
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

  // Global var with all the modules
  App = new _App()
})()
