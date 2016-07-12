/**
 * Loading screen
 * @constructor
*/
function Loading () {
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
Loading.prototype.hide = function () {
  this.vue.$data.isHidden = true
}

/**
 * Show loading screen
*/
Loading.prototype.show = function () {
  this.vue.$data.isHidden = false
}

App.Loading = new Loading()
