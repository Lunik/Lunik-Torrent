requirejs(['../jquery/jquery.min'], function () {
  requirejs(['top-menu', 'format', '../pnotif/pnotif', '../storage', '../jquery/jquery-ui.min', '../popup/popup', '../jquery/jquery.tablesorter.min'], function () {
    requirejs(['../jquery/jquery-ui.touch-punch.min', 'directory', 'torrent', 'mediainfo', 'searchtorrent'], function () {
      requirejs(['list'], function () {
        requirejs(['left-menu'], function () {
          requirejs(['config'])
        })
      })

    })
  })
})
