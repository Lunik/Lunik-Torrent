;(function () {
  /**
   * Loading screen
   * @constructor
  */
  function _Loading () {
    this.vue = new App.Vue({
      el: '.loading',
      data: {
        app: {
          state: true
        },
        action: {
          state: false
        }
      }
    })
  }

  /**
   * Hide loading screen
  */
  _Loading.prototype.hide = function (load) {
    if (this.vue.$data[load]) {
      this.vue.$data[load].state = false
    }
  }

  /**
   * Show loading screen
  */
  _Loading.prototype.show = function (load) {
    if (this.vue.$data[load]) {
      this.vue.$data[load].state = true
    }
  }

  App.Loading = new _Loading()
})()
