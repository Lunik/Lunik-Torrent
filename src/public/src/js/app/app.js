requirejs(['../jquery/jquery.min'], function () {
  requirejs(['format', '../pnotif/pnotif', '../storage', '../jquery/jquery-ui.min', '../popup/popup', '../jquery/jquery.tablesorter.min'], function () {
    requirejs(['../jquery/jquery-ui.touch-punch.min', 'config', 'directory', 'torrent', 'mediainfo', 'searchtorrent'], function () {
      requirejs(['list', 'top-menu'], function () {
        requirejs(['left-menu'], function () {})
      })
    })
  })
})
