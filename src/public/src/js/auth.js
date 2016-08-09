;(function () {
  requirejs.config({
    paths: {
      'jquery': '../bower_components/jquery/dist/jquery.min',
      'crypto-js': '../bower_components/crypto-js/crypto-js',
      'vue': '../bower_components/vue/dist/vue.min',
      'notify-me': '../bower_components/notify.me/dist/js/notify-me'
    }
  })

  // load modules
  requirejs(['jquery', 'crypto-js', 'vue'], function (jq, crypto, vue) {
    requirejs(['notify-me'], function(notif){

    })
  })
})()
