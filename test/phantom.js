var page = require('webpage').create()
var system = require('system')

var defaultColor = '\033[0m'

var runID = Date.now()
var pageToTest = system.args[1]
var port = system.env.PORT ? ':' + system.env.PORT : ''
var address = "http://localhost" + port
var t = Date.now()
var lastT = t

page.onResourceRequested = function (request) {
  console.log('==> Request: \033[33m' + request.method + '\033[0m ' + request.url)
}
page.onResourceReceived = function (response) {
  var tp = Date.now() - t
  lastT = tp
  logTime(tp)
  var color = response.statusText === 'OK' ? '\033[32m' : '\033[31m'
  console.log('<== Receive: ' + color + response.status + ' ' + response.statusText + defaultColor + ': ' + response.url)
}

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")')
}

console.log('Loading \033[36m' + address + '\033[0m')

page.open(address, function (status) {
  if (status !== 'success') {
    console.log('FAIL to load the address')
  } else {
    var tp = Date.now() - t
    lastT = tp
    logTime(tp)
    var title = page.evaluate(function () {
      return document.title
    })
    console.log('Page title is \033[32m' + title + '\033[0m')
  }
  screenshot('loading')
  setTimeout(function(){
    switch (pageToTest) {
      case 'torrent':
        page.evaluate(function(){
          return document.getElementById('torrents').click()
        })
        break;
      case 'directory':
        page.evaluate(function(){
          return document.getElementById('directories').click()
        })
        break;
    }

    console.log('Load all ressources in: \033[33m' + lastT + '\033[0m msec')

    setTimeout(function(){
      var i = 0
      setInterval(function(){
        console.log('Screen')
        screenshot(pageToTest + i)
        i++
        if(i > 10){
          phantom.exit()
          return 0
        }
      }, 1000)
    }, 1000)
  }, 1000)
})

function logTime(t){
  console.log('Time: \033[33m' + t + '\033[0m msec')
}

function screenshot(name){
  page.render('test/screenshots/' + name + '-' + runID + '.png')
}
