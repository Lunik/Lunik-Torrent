// Global variable to store all modules
var App

;(function () {
  function _App () {
    var self = this
    // Configure bower_components path
    requirejs.config({
      paths: {
        'localstorage': '../bower_components/local-storage-api/dist/storage.min',
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'jquery-ui': '../bower_components/jquery-ui/jquery-ui.min',
        'vue': '../bower_components/vue/dist/vue.min',
        'jquery.ui.touch-punch': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
        'notify-me': '../bower_components/notify.me/dist/js/notify-me',
        'popup': '../bower_components/popupjs/dist/popup.min',
        'clipboard': '../bower_components/clipboard/dist/clipboard.min'
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
        'left-menu'
      ], function (jqui, notif, pop, load, tm, conf, l, mi, st, dir, tor, lm) {
        // Get hash
        window.location = '#'
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
