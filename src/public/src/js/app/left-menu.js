var LeftMenu = new _LeftMenu()

function _LeftMenu () {
  var self = this

  this.List = new _List()

  this.body = $('.left-menu')

  this.but = {
    torrent: $('.left-menu .nav-bar #torrents'),
    directory: $('.left-menu .nav-bar #directories'),
    new: $('.left-menu .new'),
    start: $('.left-menu .start'),
    search: $('.left-menu .search'),
    input: $('.left-menu .torrent-input input'),
    close: $('.left-menu .menu #close'),
    open: $('.left-menu .menu #open')
  }

  this.but.open.click(function () {
    self.body.attr('id', 'open')
  })

  this.but.close.click(function () {
    self.body.attr('id', 'close')
  })

  this.but.torrent.click(function () {
    self.but.directory.removeClass('active')
    self.but.torrent.addClass('active')

    self.List.switchTable('torrent')
  })

  this.but.directory.click(function () {
    self.but.torrent.removeClass('active')
    self.but.directory.addClass('active')

    self.List.switchTable('directory')
  })

  this.but.new.click(function () {
    var name = prompt('Nom du nouveau dossier ?')
    if (name)
      $.post('/mkdir-d', {
        'path': document.location.hash.substring(1) ? document.location.hash.substring(1) : '/',
        'name': name
      }, function (name) {
        name = JSON.parse(name)
        if (name.err) {
          var notif = new _Pnotif()
          notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: " + file.err + '</p>', 10000)
          notif.draw()
        } else {
          self.List.Directory.append({
            name: name.name,
            isdir: true,
            isfile: false,
            size: 0,
            ctime: new Date(),
            new: true
          })
        }
      })
  })

  this.but.start.click(function () {
    if (self.but.input.val()) {
      $.post('/download-t', {
        url: self.but.input.val()
      }, function (data) {
        if (data.err) {
          var notif = new Pnotif()
          notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Action impossible: " + data.err + '</p>', 10000)
          notif.draw()
        } else {
          var notif = new Pnotif()
          notif.init('top-right', "<p style='padding: 10px; margin: 0px;'>Le torrent va commencer dans quelques instants.</p>", 10000)
          notif.draw()
        }
      })
      self.but.input.val('')
      self.but.input.trigger('keyup')
    }
  })

  this.but.search.click(function () {
    var s = new _SearchTorrent()
    s.search(self.but.input.val())
    self.but.input.val('')
    self.but.input.trigger('keyup')
  })

  this.but.input.keyup(function () {
    var value = $(this).val()
    if (value.search('.torrent') != -1 || value.search('http://') != -1 || value.search('magnet') != -1) {
      self.but.start.removeClass('hide')
      self.but.search.addClass('hide')
    } else {
      self.but.search.removeClass('hide')
      self.but.start.addClass('hide')
    }
  })
}
