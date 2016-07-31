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
          state: true,
          nb: 1
        },
        action: {
          state: false,
          nb: 0
        }
      }
    })
  }

  /**
   * Hide loading screen
  */
  _Loading.prototype.hide = function (load) {
    if (this.vue.$data[load]) {
      this.vue.$data[load].nb--
      if (this.vue.$data[load].nb <= 0) {
        this.vue.$data[load].state = false
      }
    }
  }

  /**
   * Show loading screen
  */
  _Loading.prototype.show = function (load) {
    if (this.vue.$data[load]) {
      this.vue.$data[load].state = true
      this.vue.$data[load].nb++
    }
  }

  App.Loading = new _Loading()
})()
