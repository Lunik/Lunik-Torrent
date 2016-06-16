function _Popup () {
  // Initialisation du popup
  this.init = function (posX, posY, width, height, title, html, closeBut) {
    this.posX = formatPosX(posX)
    this.posY = formatPosY(posY)
    this.width = formatWidth(width)
    console.log(width)
    /*if (this.width > 500) {
      this.whidth = 500
    }*/
    this.height = formatHeight(height)
    this.title = title
    this.html = html
    this.closeBut = closeBut
  }

  // Ouvrir le popup
  this.draw = function () {
    // Creation de l'ombre
    var $shadow = $('<div>').addClass('popupShadow').click(function () {
      this.remove()
    })

    this.selector = $shadow
    // Creation du contenu du popup
    var $container = $('<div>').addClass('popupContainer').click(function (event) {
      event.stopPropagation()
    })
      .css('width', this.width + 'px')
      .css('height', this.height + 'px')
      .css('margin-top', this.posY + 'px')
      .css('margin-left', this.posX + 'px')

    if (this.closeBut) {
      // Creation du bouton de fermeture du popup
      $('<button>').addClass('popupClose')
        .css('margin-top', -15)
        .css('margin-left', this.width - 15)
        .click(function () {
          $shadow.remove()
        })
        .appendTo($container)
    }

    $container.append(
      $('<h1>').addClass('popupTitle').append(this.title),
      $('<p>').addClass('popupHtml').append(this.html)
    ).appendTo($shadow)
    $shadow.appendTo($('body'))
  }

  this.center = function () {
    this.posX = null
    this.remove()
    this.draw()
  }

  // Fermer le popup
  this.remove = function () {
    this.selector.remove()
  }

  function formatWidth (width) {
    if (width) {
      width = width.toString()
      if (width.indexOf('%') !== -1) {
        width = width.split('%')[0]
        width = parseInt((width * $(window).width()) / 100, 10)
      }
    }
    return width
  }

  function formatHeight (height) {
    if (height) {
      height = height.toString()
      if (height.indexOf('%') !== -1) {
        height = height.split('%')[0]
        height = parseInt((height * $(window).height()) / 100, 10)
      }
    }
    return height
  }

  function formatPosX (posX) {
    if (posX) {
      posX = posX.toString()
      if (posX.indexOf('%') !== -1) {
        posX = posX.split('%')[0]
        posX = parseInt((posX * $(window).height()) / 100, 10)
      }
    }
    return posX
  }

  function formatPosY (posY) {
    if (posY) {
      posY = posY.toString()
      if (posY.indexOf('%') !== -1) {
        posY = posY.split('%')[0]
        posY = parseInt((posY * $(window).height()) / 100, 10)
      }
    }
    return posY
  }
}

$('head').append('<link rel="stylesheet" href="src/js/popup/popup.css">')
