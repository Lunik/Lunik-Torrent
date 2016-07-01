requirejs(['/src/bower_components/jquery/dist/jquery.min.js'], function () {
  requirejs(['format', '../pnotif/pnotif', '../storage', '/src/bower_components/jquery-ui/jquery-ui.min.js', '../popup/popup', '/src/bower_components/tablesorter/jquery.tablesorter.min.js'], function () {
    requirejs(['/src/bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved.js', 'config', 'directory', 'torrent', 'mediainfo', 'searchtorrent'], function () {
      requirejs(['list', 'top-menu'], function () {
        requirejs(['left-menu'], function () {})
      })
    })
  })
})
