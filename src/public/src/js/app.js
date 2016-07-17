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

      $.indexOfO = function (array, compFunc) {
        for (var key in array) {
          if (compFunc(array[key])) {
            return key
          }
        }
        return -1
      }

      requirejs([
        'jquery.ui.touch-punch',
        'notify-me',
        'popup'
      ], function (jquit, notif, pop) {
        requirejs([
          'loading',
          'top-menu',
          'config',
          'list'
        ], function (load, tm, conf, l) {
          requirejs([
            'left-menu',
            'directory'
          ], function (lm, dir) {
            requirejs([
              'left-menu'
            ], function () {
              // Update Directory and Hash
              self.hash = document.location.hash.substring(1)
              if (self.hash[self.hash.length - 1] !== '/' && self.hash.length > 0) {
                self.hash += '/'
              }
              self.TopMenu.setAriane(self.getDirFromHash())
              self.Directory.getDir(function (dir) {
                self.Directory.append(dir)
              })
              $(window).bind('hashchange', function () {
                self.hash = document.location.hash.substring(1)
                if (self.hash[self.hash.length - 1] !== '/' && self.hash.length > 0) {
                  self.hash += '/'
                }

                self.TopMenu.setAriane(self.getDirFromHash())
                App.TopMenu.setActions({
                  download: 'hide',
                  rename: 'hide',
                  remove: 'hide',
                  info: 'hide'
                })
                self.Directory.getDir(function (dir) {
                  self.Directory.append(dir)
                })
              })

              // Trigger keydown event
              $(window).keydown(function (event) {
                switch (event.keyCode) {
                  case 13:
                    // trigger start / search torrent
                    break
                }
              })

              // Everithing is loaded
              self.Loading.hide()
            })
          })
        })
      })
    })
  }

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
