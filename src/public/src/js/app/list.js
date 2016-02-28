require('src/js/app/directory.js')
require('src/js/app/torrent.js')

function _List () {
  this.Directory = new Directory()
  this.Torrent = new _Torrent()

  this.body = $('.list table tbody')
  this.col = {
    name: $('.list #name'),
    size: $('.list #size'),
    date: $('.list #date'),
    progress: $('.list #progress'),
    down: $('.list #down'),
    up: $('.list #up')
  }

  this.scrollTop = $('.scrollTop').click(function(){
    $('body').scrollTop(0)
  })
  this.Directory.getList()
}

_List.prototype.switchTable = function (nav) {
  this.body.html("")
  window.location = '#'
  switch (nav) {
    case 'torrent':
      clearTimeout(this.Directory.timer)
      this.Torrent.getList()
      this.col.name.addClass('show')
      this.col.size.addClass('show')
      this.col.date.removeClass('show')
      this.col.progress.addClass('show')
      this.col.down.addClass('show')
      this.col.up.addClass('show')
      break
    case 'directory':
      clearTimeout(this.Torrent.timer)
      this.Directory.getList()
      this.col.name.addClass('show')
      this.col.size.addClass('show')
      this.col.date.addClass('show')
      this.col.progress.removeClass('show')
      this.col.down.removeClass('show')
      this.col.up.removeClass('show')
      break
    default:

  }
}
