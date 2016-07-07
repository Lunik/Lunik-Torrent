requirejs(['../../bower_components/jquery/dist/jquery.min'], function () {
  requirejs(['format', '../../bower_components/notify.me/dist/js/notify-me', '../storage', '../../bower_components/jquery-ui/jquery-ui.min', '../popup/popup.min', '/src/bower_components/tablesorter/jquery.tablesorter.min.js'], function () {
    requirejs(['../../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved', 'config', 'directory', 'torrent', 'mediainfo', 'searchtorrent'], function () {
      requirejs(['list', 'top-menu'], function () {
        requirejs(['left-menu'], function () {})
      })
    })
  })
})
