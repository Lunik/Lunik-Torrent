function _List () {
  var self = this
  this.Directory = new _Directory()
  this.Torrent = new _Torrent()
  this.TopMenu = new _TopMenu()

  this.table = $('.list table')
  this.body = $('.list table tbody')

  this.col = $('.list th').click(function(){
    self.table.tablesorter({
      sortList: [[parseInt($(this).attr("number")),1]]
    })
  })
  this.directoryElements = {
    ariane: $('.top-menu .ariane'),
    size: $('.top-menu .folder-size'),

    newBut: $('.left-menu .new'),

    nameCol: $('.list #name'),
    sizeCol: $('.list #size'),
    dateCol: $('.list #date')
  }

  this.torrentElements = {
    input: $('.left-menu .torrent-input'),
    startBut: $('.left-menu .start'),
    searchBut: $('.left-menu .search'),

    nameCol: $('.list #name'),
    sizeCol: $('.list #size'),
    progressCol: $('.list #progress'),
    downCol: $('.list #down'),
    upCol: $('.list #up')
  }

  // click en dehors d'une ligne du table pour la deselectionner
  $('html').click(function () {
    $('.list .file').removeClass('selected')
    self.Directory.setActions('', {
      download: false,
      rename: false,
      remove: false,
      info: false
    })
    $('.list .torrent').removeClass('selected')
    self.Torrent.setActions('', {
      remove: false,
      info: false
    })
  })

  this.scrollTop = $('.scrollTop').click(function () {
    $('body').animate({
      scrollTop: 0
    }, 1000)
  })
  this.switchTable('directory')
}

_List.prototype.switchTable = function (nav) {
  this.body.html('')
  switch (nav) {
    case 'torrent':
      clearTimeout(this.Directory.timer)
      this.Torrent.getList()

      // hide directory elements
      for (var key in this.directoryElements) {
        this.directoryElements[key].addClass('hide')
      }

      // show torrents elements
      for (var key in this.torrentElements) {
        if (key == 'startBut') continue
        this.torrentElements[key].removeClass('hide')
      }

      break
    case 'directory':
      window.location = '#'
      this.TopMenu.setAriane()
      clearTimeout(this.Torrent.timer)
      this.Directory.getList()

      // hide torrents elements
      for (var key in this.torrentElements) {
        this.torrentElements[key].addClass('hide')
      }

      // show directory elements
      for (var key in this.directoryElements) {
        this.directoryElements[key].removeClass('hide')
      }

      break
    default:
  }
}
