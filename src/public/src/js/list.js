/**
 * List
 * @constructor
*/
function _List(){
  this.vue = new App.Vue({
    el: '.list',
    data: {
      tabs: [
        {
          name: 'Torrents',
          id: 'torrents',
          state: false,
          columns: [
            'name',
            'size',
            'progress',
            'up',
            'down'
          ]
        },
        {
          name: 'Directories',
          id: 'directories',
          state: true,
          columns: [
            'name',
            'size',
            'date',
            'owner'
          ]
        }
      ],
      columns: [
        {
          name: 'Name',
          id: 'name',
          important: true,
          state: ''
        },
        {
          name: 'Size',
          id: 'size',
          important: true,
          state: ''
        },
        {
          name: 'Date',
          id: 'date',
          state: ''
        },
        {
          name: 'Owner',
          id: 'owner',
          state: ''
        },
        {
          name: 'Progress',
          id: 'progress',
          state: 'hide'
        },
        {
          name: 'Up',
          id: 'up',
          state: 'hide'
        },
        {
          name: 'Down',
          id: 'down',
          state: 'hide'
        }
      ],
      lines: []
    }
  })
}

/**
 * Switch between all tables
 * @param {string} tabId - Id of the table
*/
_List.prototype.switchTab = function(tabId){
  var self = this
  for(var t in this.vue.$data.tabs){
    var tab = this.vue.$data.tabs[t]

    if(tab.id === tabId){
      tab.state = true
      for(var c in this.vue.$data.columns){
        var column = this.vue.$data.columns[c]

        if(tab.columns.indexOf(column.id) !== -1){
          column.state = ''
        }
      }
    } else {
      tab.state = false
      for(var c in this.vue.$data.columns){
        var column = this.vue.$data.columns[c]

        if(tab.columns.indexOf(column.id) !== -1 && !column.important){
          column.state = 'hide'
        }
      }
    }
  }
}

/**
 * Add lines to table
 * @param {object} line - Line to add
*/
_List.prototype.addLine = function(line){
  this.vue.$data.lines.push(line)
}
/**
 * Remove lines to table
 * @param {object} line - Line to remove
*/
_List.prototype.removeLine = function(line){
  for(var l in this.vue.$data.lines){
    if(this.vue.$data.lines[l].id === line.id){
      this.vue.$data.lines.splice(l, 1)
      return
    }
  }
}
/**
 * Clear all lines into the table
*/
_List.prototype.clearLines = function(){
  this.vue.$data.lines = []
}
App.List = new _List()
