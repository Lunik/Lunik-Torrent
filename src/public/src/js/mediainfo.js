;(function () {
  /**
   * Media info manager.
   * @constructor
  */
  class _MediaInfo {
    constructor () {
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
    get (title) {
      App.Loading.show('action')
      var type = this.getType(title)
      title = App.Format.name(title)
      var data = App.Storage.readData(title.toLowerCase())
      if (data != null) {
        this.vue.$data.info = data
        setTimeout(() => {
          App.Loading.hide('action')
          this.show()
        }, 500)
      } else {
        $.ajax({
          type: 'get',
          url: '/directory/info',
          data: {
            type: type,
            query: title.toLowerCase()
          },
          dataType: 'json',
          success: (data) => {
            if (!data.err) {
              data.description = data.description.replace(/<[^>]*>/g, '')
              data.rating = `${Math.floor(data.rating * 100) / 100}/5`
              this.vue.$data.info = data
              App.Storage.storeData(data.query.toLowerCase(), data)

              setTimeout(() => {
                this.show()
              }, 500)
            } else {
              $.notify.error({
                title: 'Error in MediaInfo.get()',
                text: data.err,
                duration: 5
              })
            }
          }
        }).done(() => {
          App.Loading.hide('action')
        }).fail((err) => {
          App.Loading.hide('action')
          console.error(`Error in MediaInfo.get() : ${err.statusText}`)
        })
      }
    }

  /**
   * Display the mediainfo popup
  */
    show () {
      $.popupjs.init({
        pos: {
          x: null,
          y: '5%'
        },
        width: '50%',
        height: '90%',
        title: this.vue.$data.info.title,
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
    getType (title) {
      title = title.toLowerCase()
      var regex = /s[0-9^e]*e[0-9]/
      if (title.search(regex) === -1) {
        return 'films'
      } else {
        return 'series'
      }
    }
}
  App.MediaInfo = new _MediaInfo()
})()
