;(function () {
  /**
   * Top Menu
   * @constructor
  */
  function _TopMenu () {
    this.vue = new App.Vue({
      el: '.top-menu',
      data: {
        actions: [
          {
            id: 'download',
            icon: 'fa-download',
            state: false
          },
          {
            id: 'rename',
            icon: 'fa-pencil',
            state: false
          },
          {
            id: 'remove',
            icon: 'fa-times',
            state: false
          },
          {
            id: 'info',
            icon: 'fa-info',
            state: false
          }
        ],
        folderSize: '0b'
      }
    })
  }

  /**
   * Update actions buttons
   * @param {object} actions - List of actions to update with states
  */
  _TopMenu.prototype.setActions = function (actions) {
    var self = this
    $.each(self.vue.$data.actions, function (index, value) {
      if (typeof actions[value.id] !== 'undefined') {
        self.vue.$data.actions[index].state = actions[value.id]
      }
    })
  }

  /**
   * Set the displayed folder size
   * @param {string} size - The size formated
  */
  _TopMenu.prototype.setFolderSize = function (size) {
    var self = this
    self.vue.$data.folderSize = size
  }

  /**
   * Set the download link for the download action button
   * @param {string} url - The url to set
  */
  _TopMenu.prototype.setDowloadLink = function (url) {
    var self = this
    var action = self.vue.$data.actions[$.indexOfO(self.vue.$data.actions, function (e) { return e.id === 'download' })]
    action.href = url
  }
  App.TopMenu = new _TopMenu()
})()
