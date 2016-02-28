require('src/js/app/list.js')

function _LeftMenu(){
  var self = this

  this.List = new _List()

  this.but = {
    torrent: $('.left-menu .nav-bar #torrents'),
    directory: $('.left-menu .nav-bar #directories')
  }

  this.but.torrent.click(function(){
    self.but.directory.removeClass('active')
    self.but.torrent.addClass('active')

    self.List.switchTable('torrent')
  })

  this.but.directory.click(function(){
    self.but.torrent.removeClass('active')
    self.but.directory.addClass('active')

    self.List.switchTable('directory')
  })
}
