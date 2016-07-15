/**
 * Left Menu
*/
function _LeftMenu(){
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
          state: 'hide'
        },
        {
          name: 'Search',
          class: 'search',
          state: 'hide'
        },
        {
          name: 'New',
          class: 'new',
          state: ''
        }
      ],
      inputs: [
        {
          name: 'Torrent Input',
          class: 'torrent-input',
          type: 'text',
          placeholder: 'Search or Torrent Link...',
          state: 'hide'
        }
      ],
      currentAction: 'new'
    }
  })

  $('.left-menu').on('keyup', '.torrent-input input', function(){
    var value = $(this).val()
    if (value.search('.torrent') !== -1 || value.search('http://') !== -1 || value.search('magnet') !== -1) {
      self.switchTorrent('start')
    } else {
      self.switchTorrent('search')
    }
  })

  $('.left-menu').on('click', '.nav-bar li', function(){
    self.switchTab($(this).attr('id'))
    App.List.switchTab($(this).attr('id'))
  })
}

/**
 * Switch between all tables
 * @param {string} tabId - Id of the table
*/
_LeftMenu.prototype.switchTab = function(tabId){
  var self = this
  for(var t in this.vue.$data.tabs){
    var tab = this.vue.$data.tabs[t]

    if(tab.id === tabId){
      if(!tab.state){
        App.List.clearLines()
      }
      tab.state = true
      self.vue.$data.currentAction = tab.actions[0]
      for(var a in this.vue.$data.actions){
        var action = this.vue.$data.actions[a]

        if(tab.actions.indexOf(action.class) !== -1){
          action.state = ''
        }
      }
      for(var i in this.vue.$data.inputs){
        var input = this.vue.$data.inputs[i]

        if(tab.inputs.indexOf(input.class) !== -1){
          input.state = ''
        }
      }
    } else {
      tab.state = false
      for(var a in this.vue.$data.actions){
        var action = this.vue.$data.actions[a]

        if(tab.actions.indexOf(action.class) !== -1){
          action.state = 'hide'
        }
      }
      for(var i in this.vue.$data.inputs){
        var input = this.vue.$data.inputs[i]

        if(tab.inputs.indexOf(input.class) !== -1){
          input.state = 'hide'
        }
      }
    }
  }

  App.TopMenu.setActions({
    download: 'hide',
    rename: 'hide',
    remove: 'hide',
    info: 'hide'
  })
  if(tabId === 'directories'){
    if(App.hash){
      window.location.hash = "#"
    } else {
      App.Directory.getDir(function(dir){
        App.Directory.append(dir)
      })
    }
  } else if(tabId === 'torrents'){
    self.switchTorrent(tab.actions[0])
  }
}

/**
 * Switch between all torrents functions
 * @param {string} act - class of the torren action
*/
_LeftMenu.prototype.switchTorrent = function(act){
  var self = this
  self.vue.$data.currentAction = act
  var tab = $.grep(self.vue.$data.tabs, function(e){ return e.id === 'torrents' })[0]
  if(tab.state){
    for(var ta in tab.actions){
      for(var a in self.vue.$data.actions){
        var action = self.vue.$data.actions[a]
        if(act === action.class){
          action.state = ''
        } else {
          action.state = 'hide'
        }
      }
    }
  }
}

_LeftMenu.prototype.open = function(){
  this.vue.$data.state = 'open'
  this.vue.$data.reverseState = 'close'
}

_LeftMenu.prototype.close = function(){
  this.vue.$data.state = 'close'
  this.vue.$data.reverseState = 'open'
}

App.LeftMenu = new _LeftMenu()
