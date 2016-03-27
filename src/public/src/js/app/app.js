requirejs(['top-menu', 'format', '../pnotif/pnotif', '../storage', '../jquery/jquery-ui.min', '../jquery/jquery-ui.touch-punch.min', '../popup/popup', '../jquery/jquery.tablesorter.min'], function () {
  requirejs(['directory', 'torrent', 'mediainfo', 'searchtorrent'], function () {
    requirejs(['list'], function () {
      requirejs(['left-menu'])
    })

  })
})
