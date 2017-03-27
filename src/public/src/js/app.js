// Global variable to store all modules
var App

;(function () {
  class _App {
    constructor () {
    // Configure bower_components path
      requirejs.config({
        priority: ['jquery'],
        paths: {
          'localstorage': '../lib/local-storage-api/dist/storage.min',
          'jquery': '../lib/jquery/dist/jquery.min',
          'jquery-ui': '../lib/jquery-ui/jquery-ui.min',
          'vue': '../lib/vue/dist/vue.min',
          'jquery.ui.touch-punch': '../lib/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
          'notify-me': '../lib/notify.me/dist/js/notify-me',
          'popup': '../lib/popupjs/dist/popup.min',
          'clipboard': '../lib/clipboard/dist/clipboard.min',
          'snow': '../lib/jquery.snow.min.1.0'
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
      ], (v, ls, jq, jqui, f, Clip) => {
        this.Vue = v
        this.Storage = new Storage()
        this.Clipboard = new Clip('.clip-but')
      /**
       * Get The index of an object into an array
       * @param {array} array - The array
       * @param {function} compFunc - Function to determine the object
      */
        $.indexOfO = (array, compFunc) => {
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
        ], (jqui, snow, notif, pop, load, tm, conf, l, mi, st, dir, tor, lm) => {
        // Get hash
          this.hash = document.location.hash.substring(1)
          if (this.hash[this.hash.length - 1] !== '/' && this.hash.length > 0) {
            this.hash += '/'
          }

        // Start with directory
          this.Directory.getDir((dir) => {
            this.Directory.append(dir)
          })
          this.Directory.setRefresh(true, 30000)

        // on hash change set hash and reload directory
          $(window).bind('hashchange', () => {
            $('.list .file').removeClass('selected')
            $('.list .torrent').removeClass('selected')

            this.hash = document.location.hash.substring(1)
            if (this.hash[this.hash.length - 1] !== '/' && this.hash.length > 0) {
              this.hash += '/'
            }

            App.TopMenu.setActions({
              download: false,
              rename: false,
              remove: false,
              info: false
            })
            this.Directory.getDir((dir) => {
              this.Directory.append(dir)
            })
          })

        // Trigger keydown event
          $(window).keydown((event) => {
            switch (event.keyCode) {
              case 13:
                $(`.left-menu .action .${App.LeftMenu.vue.$data.currentAction}`).trigger('click')
                break
            }
          })

        // Everithing is loaded
          this.Loading.hide('app')
        })
      })
    }

  /**
   * Get directory array from hash
   * @return {array} - Array of directories
  */
    getDirFromHash () {
      var dir = this.hash.split('/') || ''
      for (var i in dir) {
        if (dir[i] === '') {
          dir.splice(i, 1)
        }
      }
      return dir
    }
}

  // Global var with all the modules
  App = new _App()
})()
