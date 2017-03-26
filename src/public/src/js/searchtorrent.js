;(function () {
  /**
   * Search torrent manager
   * @constructor
  */
  class _SearchTorrent {
    constructor () {
      this.vue = new App.Vue({
        el: '.searchtorrent-pop',
        data: {
          results: {
            films: [],
            series: []
          }
        }
      })

      $('.searchtorrent-pop').on('click', 'tr.search-item', (e) => {
        $('.torrent-input input').val($(e.currentTarget).attr('data-torrent')).trigger('keyup')
        $.popupjs.remove()
      })
    }

  /**
   * Search a torrent and show the results in popup
   * @param {string} query - The torrent to search
  */
    search (query) {
      App.Loading.show('action')
      $.ajax({
        type: 'post',
        url: '/torrent/search',
        data: {
          query: query
        },
        dataType: 'json',
        success: (data) => {
          this.vue.$data.results.films = data.mv.items
          this.vue.$data.results.series = data.tv.items

          setTimeout(() => {
            this.show()
          }, 1000)
        }
      }).done(() => {
        App.Loading.hide('action')
      }).fail((err) => {
        App.Loading.hide('action')
        console.error(`Error in SearchTorrent.search() : ${err.statusText}`)
      })
    }

  /**
   * Show the search torrent popup
  */
    show () {
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
}
  App.SearchTorrent = new _SearchTorrent()
})()
