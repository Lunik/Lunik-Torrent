/**
 * Top menu manager.
 * @constructor
*/
function _TopMenu () {
  var self = this
  this.ariane = $('.top-menu .ariane')
  this.Config = new Config()

  $(window).bind('hashchange', function () {
    self.setAriane()
  })
  self.setAriane()
}

/**
 * Set the ariane links.
*/
_TopMenu.prototype.setAriane = function () {
  var self = this
  this.ariane.html('')
  var $delimiter = $('<span>').addClass('delimiter').text('>')

  $('<a>').addClass('button').attr('href', '#').attr('data-file', '/').text('Home').appendTo(this.ariane)

  var directories = document.location.hash.substring(1).split('/')
  directories.pop()

  var begin = 0
  if (directories.length >= 5) {
    self.ariane.append($delimiter.clone())
    $('<a>').text('...').appendTo(this.ariane)
    begin = directories.length - 4
  }

  var profDir = ''
  var i = 0
  directories.forEach(function (dir, index) {
    if (dir !== '') {
      profDir += dir + '/'
      if (i >= begin) {
        self.ariane.append($delimiter.clone())

        var $dir = $('<a>').addClass('button').attr('href', '#' + profDir).text(dir)
        if (directories.length - 1 === index) {
          $dir.addClass('active')
        }
        self.ariane.append($dir)
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
          $.notify.error({
            title: 'Error',
            text: file.err
          })
        } else {
          $('tr[data-file="' + file.file + '"]').remove()
        }
      })
    }
  })
}
