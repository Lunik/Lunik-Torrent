;(function () {
  /**
   * Left Menu
   * @constructor
  */
  function _LeftMenu () {
    var self = this
    this.vue = new App.Vue({
      el: '.left-menu',
      data: {
        state: 'close',
        reverseState: 'open',
        tabs: [
          {
            name: 'Torrents',
            id: 'torrents',
            state: false,
            actions: [
              'search',
              'start'
            ],
            inputs: [
              'torrent-input'
            ]
          },
          {
            name: 'Directories',
            id: 'directories',
            state: true,
            actions: [
              'new'
            ],
            inputs: []
          }
        ],
        actions: [
          {
            name: 'Start',
            class: 'start',
            state: false
          },
          {
            name: 'Search',
            class: 'search',
            state: false
          },
          {
            name: 'New',
            class: 'new',
            state: true
          }
        ],
        inputs: [
          {
            name: 'Torrent Input',
            class: 'torrent-input',
            type: 'text',
            placeholder: 'Search or Torrent Link...',
            state: false,
            dataList: App.Storage.readData('listInput-torrent-input') ? App.Storage.readData('listInput-torrent-input') : []
          }
        ],
        currentAction: 'new',
        version: 'v'
      }
    })

    $('.left-menu').on('keyup', '.torrent-input input', function () {
      var value = $(this).val()
      if (value.search('.torrent') !== -1 || value.search('http://') !== -1 || value.search('magnet') !== -1) {
        self.switchTorrent('start')
      } else {
        self.switchTorrent('search')
      }
    })

    $('.top-menu').on('click', '.logo', function () {
      self.switchTab('directories')
      App.List.switchTab('directories')
    })

    $('.left-menu').on('click', '.nav-bar li', function () {
      self.switchTab($(this).attr('id'))
      App.List.switchTab($(this).attr('id'))
      App.List.sortLines('name', 'asc')
    })

    $('.left-menu').on('click', '.open', function () {
      self.open()
    })
    $('.left-menu').on('click', '.close', function () {
      self.close()
    })

    $.ajax({
      type: 'get',
      url: '/version',
      dataType: 'json',
      success: function (data) {
        if (data.err) {
          $.notify.error({
            title: 'Error',
            text: data.err,
            duration: 10
          })
        } else {
          self.vue.$data.version = `v${data.version}`
        }
      }
    })
  }

  /**
   * Switch between all tables
   * @param {string} tabId - Id of the table
  */
  _LeftMenu.prototype.switchTab = function (tabId) {
    var self = this
    var a, i, action, input
    for (var t in this.vue.$data.tabs) {
      var tab = this.vue.$data.tabs[t]

      if (tab.id === tabId) {
        if (!tab.state) {
          App.List.clearLines()
        }
        tab.state = true
        self.vue.$data.currentAction = tab.actions[0]
        for (a in this.vue.$data.actions) {
          action = this.vue.$data.actions[a]

          if (tab.actions.indexOf(action.class) !== -1) {
            action.state = true
          }
        }
        for (i in this.vue.$data.inputs) {
          input = this.vue.$data.inputs[i]

          if (tab.inputs.indexOf(input.class) !== -1) {
            input.state = true
          }
        }
      } else {
        tab.state = false
        for (a in this.vue.$data.actions) {
          action = this.vue.$data.actions[a]

          if (tab.actions.indexOf(action.class) !== -1) {
            action.state = false
          }
        }
        for (i in this.vue.$data.inputs) {
          input = this.vue.$data.inputs[i]

          if (tab.inputs.indexOf(input.class) !== -1) {
            input.state = false
          }
        }
      }
    }

    App.TopMenu.setActions({
      download: false,
      rename: false,
      remove: false,
      info: false
    })
    if (tabId === 'directories') {
      if (App.hash) {
        window.location.hash = '#'
      } else {
        App.Directory.getDir(function (dir) {
          App.Directory.append(dir)
        })
      }
      App.Directory.setRefresh(true, 30000)
      App.Torrent.setRefresh(false)
    } else if (tabId === 'torrents') {
      self.switchTorrent(this.vue.$data.tabs[0].actions[0])
      App.Torrent.getTorrents(function (tor) {
        App.Torrent.append(tor)
      })
      App.Torrent.setRefresh(true, 3000)
      App.Directory.setRefresh(false)
    }
  }

  /**
   * Switch between all torrents functions
   * @param {string} act - class of the torren action
  */
  _LeftMenu.prototype.switchTorrent = function (act) {
    var self = this
    self.vue.$data.currentAction = act
    var tab = $.grep(self.vue.$data.tabs, function (e) { return e.id === 'torrents' })[0]
    if (tab.state) {
      for (var a in self.vue.$data.actions) {
        var action = self.vue.$data.actions[a]
        if (act === action.class) {
          action.state = true
        } else {
          action.state = false
        }
      }
    }
  }

  /**
   * Open the left Menu
  */
  _LeftMenu.prototype.open = function () {
    this.vue.$data.state = 'open'
    this.vue.$data.reverseState = 'close'
  }

  /**
   * Close the left Menu
  */
  _LeftMenu.prototype.close = function () {
    this.vue.$data.state = 'close'
    this.vue.$data.reverseState = 'open'
  }

  _LeftMenu.prototype.addInputList = function (inputName, elem) {
    var self = this
    var input = $.grep(self.vue.$data.inputs, function (e) { return e.class === inputName })[0]
    if (input.dataList.indexOf(elem) === -1) {
      input.dataList.push(elem)
      App.Storage.storeData('listInput-' + inputName, input.dataList)
    }
  }
  App.LeftMenu = new _LeftMenu()
})()
