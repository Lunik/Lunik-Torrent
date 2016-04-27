function _TopMenu () {
  var self = this
  this.ariane = $('.top-menu .ariane')
  this.Config = new Config()

  this.notif = new Pnotif()

  $(window).bind('hashchange', function () {
    self.setAriane()
  })
}

_TopMenu.prototype.setAriane = function () {
  var self = this
  this.ariane.html('')
  var $delimiter = $('<span>').addClass('delimiter').text('>')

  var $home = $('<a>').addClass('button').attr('href', '#').attr('data-file', '/').text('Home').appendTo(this.ariane)

  var directories = document.location.hash.substring(1).split('/')
  var begin = 0
  if (directories.length >= 5) {
    self.ariane.append($delimiter.clone())
    var $point = $('<a>').text('...').appendTo(this.ariane)
    begin = directories.length - 6
  }
  var profDir = ''
  var i = 0
  directories.forEach(function (dir) {
    if (dir != '') {
      profDir += dir + '/'
      if (i >= begin) {
        self.ariane.append($delimiter.clone())
        $('<a>').addClass('button').attr('href', '#' + profDir).text(dir).appendTo(self.ariane)
      }
    }
    i++
  })

  $('.fil-ariane a').droppable({
    greedy: true,
    drop: function (data) {
      var folder = ''
      var file = $(data.toElement).attr('data-file')
      var path = $(this).attr('href')

      $.post('/mv-d', {
        'file': file,
        'path': path,
        'folder': folder
      }, function (file) {
        file = JSON.parse(file)
        if (file.err) {
          self.notif.remove()
          self.notif.init('top-right', "<p style='padding: 10px; margin: 0px; color:red;'>Error: " + file.err + '</p>', 10000)
          self.notif.draw()
        } else {
          $('tr[data-file="' + file.file + '"]').remove()
        }
      })
    }
  })
}
