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
    if(this.vue.$data.lines[l].name === line.name){
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

/**
 * Update all lines into the table
 * And remove absent lines
*/
_List.prototype.updateLines = function(lines){
   var self = this
  $.each(lines, function(index, value){

    var li = $.indexOfO(self.vue.$data.lines, function(e){ return e.name === value.name })
    if(li !== -1){
      var line = self.vue.$data.lines[li]
      $.each(value, function(i, v){
        line[i] = v
      })
    } else {
      self.addLine(value)
    }
  })

  var vueLines = self.vue.$data.lines.slice(0)
  for(var key in vueLines){
    console.log(key)
    var line = vueLines[key]
    var li = $.indexOfO(lines, function(e){ return e.name === line.name })
    if(li === -1){
      self.removeLine(line)
    }
  }
}

_List.prototype.sortLines = function(by, direction){
  var dir = direction === 'asc' ? -1 : 1
  if(typeof this.vue.$data.lines[0][by] !== 'undefined'){
    this.vue.$data.lines.sort(function(a, b){
      if(a[by] < b[by]){
        return dir
      } else if (a[by] > b[by]){
        return -dir
      } else {
        return 0
      }
    })
  }
}

App.List = new _List()
