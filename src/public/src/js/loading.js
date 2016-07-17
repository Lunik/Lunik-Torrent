;(function () {
  /**
   * Loading screen
   * @constructor
  */
  function _Loading () {
    this.vue = new App.Vue({
      el: '.loading',
      data: {
        isHidden: false
      }
    })
  }

  /**
   * Hide loading screen
  */
  _Loading.prototype.hide = function () {
    this.vue.$data.isHidden = true
  }

  /**
   * Show loading screen
  */
  _Loading.prototype.show = function () {
    this.vue.$data.isHidden = false
  }

  App.Loading = new _Loading()
})()
