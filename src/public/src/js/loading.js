;(function () {
  /**
   * Loading screen
   * @constructor
  */
  class _Loading {
    constructor () {
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
    hide (load) {
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
    show (load) {
      if (this.vue.$data[load]) {
        this.vue.$data[load].state = true
        this.vue.$data[load].nb++
      }
    }
}
  App.Loading = new _Loading()
})()
