function Loading(){
  this.vue = new App.Vue({
    el: '.loading',
    data: {
      isHidden: false
    }
  })
}

Loading.prototype.hide = function () {
  this.vue.$data.isHidden = true
}

Loading.prototype.show = function () {
  this.vue.$data.isHidden = false
}

App.Loading = new Loading()
