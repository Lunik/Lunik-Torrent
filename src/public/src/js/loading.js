/**
 * Ecran de chargement
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
 * Cache l'ecran de chargement
*/
Loading.prototype.hide = function () {
  this.vue.$data.isHidden = true
}

/**
 * Montre l'ecran de chargement
*/
Loading.prototype.show = function () {
  this.vue.$data.isHidden = false
}

App.Loading = new Loading()
