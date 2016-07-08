var Storage = new _Storage()

function Config () {
  var self = this
  this.config = {}
  this.themeList = ['default', 'monokai', 'giant_goldfish', 'lunik']

  this.but = $('.parameter .button').click(function () {
    $.popupjs.init({
      pos: {
        x: null,
        y: '5%'
      },
      width: '50%',
      height: '90%',
      title: 'Configuration',
      html: self.getHtml(self.config),
      closeBut: true
    })
    $.popupjs.draw()
  })

  this.setConfig(Storage.readData('config'))
  this.applyConfig(this.config)
  this.configReady()
}

Config.prototype.getHtml = function () {
  var self = this
  var $html = $('<div/>').addClass('config-pop').click(function (event) {
    event.stopPropagation()
  })

  var $theme = $('<select>').addClass('theme').on('change', function (data) {
    self.applyTheme($(this).val())
  })

  for (var theme in this.themeList) {
    var $option = $('<option>').attr('value', this.themeList[theme]).text(this.themeList[theme])
    if (this.config.theme === this.themeList[theme]) {
      $option.attr('selected', 'true')
    }
    $option.appendTo($theme)
  }
  $theme.appendTo($html)

  $('<input>').addClass('submit button').attr('type', 'submit').attr('value', 'Save').appendTo($html).click(function () {
    self.submit()
  })
  return $html
}

Config.prototype.submit = function () {
  var config = {}
  config.theme = $('.config-pop .theme').val()
  this.setConfig(config)
  this.applyConfig(config)
  $.popup.remove()
}

Config.prototype.setConfig = function (config) {
  if (config) {
    for (var key in config) {
      this.config[key] = config[key]
    }
    Storage.storeData('config', this.config)
  }
}

Config.prototype.applyConfig = function (config) {
  if (config) {
    this.applyTheme(config.theme)
  }
}

Config.prototype.applyTheme = function (theme) {
  theme = 'default' || theme
  if ($('head .theme').length > 0) {
    $('head .theme').attr('href', 'src/css/themes/' + theme + '/theme.css')
  } else {
    $('<link>').addClass('theme').attr('rel', 'stylesheet').attr('href', 'src/css/themes/' + theme + '/theme.css').appendTo($('head'))
  }
}

Config.prototype.configReady = function () {
  $('.loading').remove()
}
