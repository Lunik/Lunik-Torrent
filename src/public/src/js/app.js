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
      'tablesorter': '../bower_components/tablesorter/jquery.tablesorter.min',
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
    requirejs([
      'jquery.ui.touch-punch',
      'tablesorter',
      'notify-me',
      'popup'
    ], function (jquit, ts, notif, pop) {
      requirejs([
        'loading',
        'top-menu',
        'config',
        'list'
      ], function (load, tm, conf, l) {
        requirejs([
          'left-menu',
          'directory'
        ], function(lm, dir){
          requirejs([
            'left-menu'
          ], function(){
            // Update Directory and Hash
            self.hash = document.location.hash.substring(1)
            self.TopMenu.setAriane(self.getDirFromHash())
            self.Directory.getDir(function(dir){
              self.Directory.append(dir)
            })
            $(window).bind('hashchange', function () {
              self.hash = document.location.hash.substring(1)

              self.TopMenu.setAriane(self.getDirFromHash())
              App.TopMenu.setActions({
                download: 'hide',
                rename: 'hide',
                remove: 'hide',
                info: 'hide'
              })
              self.List.clearLines()
              self.Directory.getDir(function(dir){
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
var App = new _App()

Array.prototype.indexOfO = function(compFunc){
  for(var key in this){
    if(compFunc(this[key])){
      return key
    }
  }
  return -1
}
