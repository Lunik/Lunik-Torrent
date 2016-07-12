function App () {
  var self = this
  // Configure le path pour les bower_components
  requirejs.config({
    paths: {
      'localstorage': '../bower_components/local-storage-api/dist/storage.min',
      'jquery': '../bower_components/jquery/dist/jquery.min',
      'jquery-ui': '../bower_components/jquery-ui/jquery-ui.min',
      'vue': '../bower_components/vue/dist/vue.min',
      'jquery.ui.touch-punch': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
      'tablesorter': '../bower_components/tablesorter/jquery.tablesorter.min',
      'notify-me': '../bower_components/notify.me/dist/js/notify-me',
      'popup': '../bower_components/popupjs/dist/popup.min'
    }
  })

  // Charge les modules
  requirejs([
    'localstorage',
    'jquery',
    'jquery-ui',
    'vue'
  ], function (ls, jq, ui, v) {
    self.Vue = v
    self.Storage = new Storage()
    requirejs([
      'jquery.ui.touch-punch',
      'tablesorter',
      'notify-me',
      'popup'
    ], function () {
      requirejs(['loading', 'top-menu'], function () {
        self.Loading.hide()

        self.hash = document.location.hash.substring(1)
        $(window).bind('hashchange', function () {
          self.hash = document.location.hash.substring(1)
        })
      })
    })
  })
}

App.prototype.getDirFromHash = function () {
  var dir = document.location.hash.substring(1).split('/')
  for (var i in dir) {
    if (dir[i] === '') {
      dir.splice(i, 1)
    }
  }
  return dir
}

// Variable global avec tous les modules
var App = new App()
