var App = {}

requirejs.config({
  paths: {
    'localstorage': '../bower_components/local-storage-api/dist/storage.min',
    'jquery': '../bower_components/jquery/dist/jquery.min',
    'jquery-ui': '../bower_components/jquery-ui/jquery-ui.min',
    'vue': '../bower_components/vue/dist/vue.min',
    'jquery.ui.touch-punch': '../bower_components/jquery-ui-touch-punch-improved/jquery.ui.touch-punch-improved',
    'tablesorter': '../bower_components/tablesorter/jquery.tablesorter.min',
    'notify-me': '../bower_components/notify.me/dist/js/notify-me',
    'popup': '../bower_components/popupjs/dist/popup.min'
  }
})

requirejs([
  'localstorage',
  'jquery',
  'jquery-ui',
  'vue'
], function (ls, jq, ui, v) {
  console.log(ls)
  App.Vue = v
  App.ls = ls
  requirejs([
    'jquery.ui.touch-punch',
    'tablesorter',
    'notify-me',
    'popup'
  ], function () {
    requirejs(['loading'], function () {})
  })
})
