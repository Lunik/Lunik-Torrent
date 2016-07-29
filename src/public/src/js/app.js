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
        'popup': '../bower_components/popupjs/dist/popup.min'
      }
    })

    // load modules
    requirejs([
      'vue',
      'localstorage',
      'jquery',
      'jquery-ui',
      'format'
    ], function (v, ls, jq, jqui, f) {
      self.Vue = v
      self.Storage = new Storage()

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
      requirejs([
        'jquery.ui.touch-punch',
        'notify-me',
        'popup'
      ], function (jquit, notif, pop) {
        // load 1st layer app modules
        requirejs([
          'loading',
          'top-menu',
          'config',
          'list',
          'mediainfo',
          'searchtorrent'
        ], function (load, tm, conf, l) {
          // load 2nd layer app modules
          requirejs([
            'left-menu',
            'directory',
            'torrent'
          ], function (lm, dir) {
            // load last layer app modules
            requirejs([
              'left-menu'
            ], function () {
              // Get hash
              self.hash = document.location.hash.substring(1)
              if (self.hash[self.hash.length - 1] !== '/' && self.hash.length > 0) {
                self.hash += '/'
              }

              // Start with directory
              self.TopMenu.setAriane(self.getDirFromHash())
              self.Directory.getDir(function (dir) {
                self.Directory.append(dir)
              })
              self.Directory.setRefresh(true, 30000)

              // on hash change set hash and reload directory
              $(window).bind('hashchange', function () {
                self.hash = document.location.hash.substring(1)
                if (self.hash[self.hash.length - 1] !== '/' && self.hash.length > 0) {
                  self.hash += '/'
                }

                self.TopMenu.setAriane(self.getDirFromHash())
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
                    $('.left-menu .action .' + App.LeftMenu.vue.$data.currentAction).trigger('click')
                    break
                }
              })

              // Everithing is loaded
              self.Loading.hideLarge()
            })
          })
        })
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
