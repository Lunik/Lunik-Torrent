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
          state: 'hide'
        },
        {
          id: 'rename',
          icon: 'fa-pencil',
          state: 'hide'
        },
        {
          id: 'remove',
          icon: 'fa-times',
          state: 'hide'
        },
        {
          id: 'info',
          icon: 'fa-info',
          state: 'hide'
        }
      ],
      ariane: [],
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
 * Update Ariane link
 * @param {object} list - List sorted of directories
*/
_TopMenu.prototype.setAriane = function (list) {
  var self = this
  self.vue.$data.ariane = []
  var profDir = ''
  for (var key in list) {
    profDir += list[key] + '/'
    self.vue.$data.ariane.push({
      path: profDir,
      name: list[key]
    })
  }
}

/**
 * Set the displayed folder size
 * @param {string} size - The size formated
*/
_TopMenu.prototype.setFolderSize = function (size) {
  var self = this
  self.vue.$data.folderSize = size
}

App.TopMenu = new _TopMenu()
