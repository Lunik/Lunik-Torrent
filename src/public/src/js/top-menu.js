function TopMenu () {
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
      folderSize: 0
    }
  })
}

TopMenu.prototype.setActions = function (actions) {
  var self = this
  $.each(self.vue.$data.actions, function (index, value) {
    if (actions[value.id]) {
      value.state = actions[value.id]
    }
  })
}

TopMenu.prototype.setAriane = function (list) {
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

TopMenu.prototype.setFolderSize = function (size) {
  self.vue.$data.folderSize = size
}

App.TopMenu = new TopMenu()
