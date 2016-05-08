function Pnotif () {
  this.init = function (pos, html, timeOut) {
    this.pos = getXYFromPos(pos)
    this.html = html
    this.timeOut = timeOut
  }

  this.container = null

  this.draw = function () {
    var $container = $('<div>').addClass('pnotif-container')
    this.container = $container
    for (var key in this.pos) {
      $container.css(key, this.pos[key])
    }

    $container.append(this.html)
    $('body').append($container)

    $container.fadeIn().delay(this.timeOut).fadeOut('slow')
    setTimeout(function () {
      $container.remove()
    }, this.timeOut + 1000)
  }

  this.remove = function () {
    if (this.container) {
      this.container.remove()
    }
  }
}

function getXYFromPos (pos) {
  var xy = {}
  switch (pos) {
    case 'top-right':
      xy.top = '5%'
      xy.right = '3%'
      break

    case 'top-left':
      xy.top = '5%'
      xy.left = '3%'
      break

    case 'bottom-right':
      xy.bottom = '15%'
      xy.right = '3%'
      break

    case 'bottom-left':
      xy.bottom = '15%'
      xy.left = '3%'
      break

    default:
      xy.bottom = '15%'
      xy.left = '5%'
      break
  }

  return xy
}

$('head').append('<link rel="stylesheet" href="src/js/pnotif/pnotif.css">')
