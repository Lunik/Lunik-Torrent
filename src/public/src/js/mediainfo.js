;(function () {
  /**
   * Media info manager.
   * @constructor
  */
  function _MediaInfo () {
    this.vue = new App.Vue({
      el: '.popup .mediainfo-pop',
      data: {
        info: {}
      }
    })
  }

  /**
   * Get media info from the server.
   * @param {string} title - Media title.
  */
  _MediaInfo.prototype.get = function (title) {
    var self = this
    var type = self.getType(title)
    title = App.Format.name(title)
    var data = App.Storage.readData(title)
    if (data != null) {
      self.vue.$data.info = data
      setTimeout(function () {self.show()}, 1000)
    } else {
      $.post('/info-d', {
        type: type,
        query: title
      }, function (data) {
        data = JSON.parse(data)
        console.log(data)
        self.vue.$data.info = data
        App.Storage.storeData(data.query.toLowerCase(), data)
        self.show()
      })
    }
  }

  /**
   * Display the mediainfo popup
  */
  _MediaInfo.prototype.show = function () {
    var self = this
    $.popupjs.init({
      pos: {
        x: null,
        y: '5%'
      },
      width: '50%',
      height: '90%',
      title: self.vue.$data.info.title,
      html: $('.popup .mediainfo-pop'),
      closeBut: true
    })
    $.popupjs.draw()
  }

  /**
   * Get type of the media (tvshow / movie).
   * @param {string} title - Media title.
   * @return {string} - Type of the media (films / series)
  */
  _MediaInfo.prototype.getType = function (title) {
    title = title.toLowerCase()
    var regex = /s[0-9^e]*e[0-9]/
    if (title.search(regex) === -1) {
      return 'films'
    } else {
      return 'series'
    }
  }
  App.MediaInfo = new _MediaInfo()
})()
