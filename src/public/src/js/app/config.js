var Storage = new _Storage()

function Config(){
  var self = this
  this.config = {}
  this.themeList = ['default', 'monokai']
  this.popup = new _Popup()

  this.but = $('.parameter .button').click(function(){
    self.popup.init(null, '5%', null, '90%', 'Configuration', self.getHtml(self.config), true)
    self.popup.draw()
  })

  this.setConfig(Storage.readData('config'))
  this.applyConfig(this.config)
}

Config.prototype.getHtml = function(){
  var self = this
  $html = $('<div/>').addClass('config-pop').click(function(){
    event.stopPropagation()
  })

  var $theme = $('<select>').addClass('theme')

  for(var theme in this.themeList){
    var $option = $('<option>').attr('value',themeList[theme]).text(themeList[theme])
    if(this.config.theme == themeList[theme]){
      $option.attr('selected','true')
    }
    $option.appendTo($theme)
  }
  $theme.appendTo($html)

  $submit = $('<input>').addClass('submit button').attr('type', 'submit').attr('value', 'Save').appendTo($html).click(function(){
    self.submit()
  })
  return $html
}

Config.prototype.submit = function(){
  var config = {}
  config.theme = $('.config-pop .theme').val()
  this.setConfig(config)
  this.popup.remove()
}

Config.prototype.setConfig = function(config){
  if(config){
    for(var key in config){
      this.config[key] = config[key]
    }
    Storage.storeData('config', this.config)
  }
}

Config.prototype.applyConfig = function(config){
  if(config){
    this.applyTheme(config.theme)
  }
}

Config.prototype.applyTheme = function(theme){
  if($('head .theme').length > 0){
    var $themeLink = $('head .theme').attr('href','src/css/themes/'+theme+'/theme.css')
  } else {
    var $themeLink = $('<link>').addClass('theme').attr('rel','stylesheet').attr('href','src/css/themes/'+theme+'/theme.css').appendTo($('head'))
  }
}
