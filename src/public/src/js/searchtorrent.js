;(function () {
  /**
   * Search torrent manager
   * @constructor
  */
  function _SearchTorrent () {
    this.vue = new App.Vue({
      el: '.searchtorrent-pop',
      data: {
        results: {
          films: [],
          series: []
        }
      }
    })

    $('.searchtorrent-pop').on('click', 'tr.search-item', function () {
      $('.torrent-input input').val($(this).attr('data-torrent')).trigger('keyup')
      $.popupjs.remove()
    })
  }

  /**
   * Search a torrent and show the results in popup
   * @param {string} query - The torrent to search
  */
  _SearchTorrent.prototype.search = function (query) {
    App.Loading.show('action')
    var self = this
    $.ajax({
      type: 'post',
      url: '/search-t',
      timeout: 10000,
      data: {
        query: query
      },
      dataType: 'json',
      success: function (data) {
        self.vue.$data.results.films = data.mv.items

        if (data.tv) {
          self.vue.$data.results.series = data.tv.items
        } else {
          for (var key in data.tvfr.items) { data.tven.items[key] = data.tvfr.items[key] }
          self.vue.$data.results.series = data.tven.items
        }

        setTimeout(function () {
          self.show()
        }, 1000)
      }
    }).done(function () {
      App.Loading.hide('action')
    }).fail(function (err) {
      App.Loading.hide('action')
      $.notify.error({
        title: 'Error in SearchTorrent.search()',
        text: err.statusText,
        duration: 5
      })
    })
  }

  /**
   * Show the search torrent popup
  */
  _SearchTorrent.prototype.show = function () {
    $.popupjs.init({
      pos: {
        x: null,
        y: '5%'
      },
      width: '90%',
      height: '90%',
      title: 'Search',
      html: $('.popup .searchtorrent-pop'),
      closeBut: true
    })
    $.popupjs.draw()
  }
  App.SearchTorrent = new _SearchTorrent()
})()
