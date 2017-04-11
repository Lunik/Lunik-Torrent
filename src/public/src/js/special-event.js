;(function () {
  var THISYEAR = (new Date()).getFullYear()
  var TODAY = (new Date())
  function loadChristmas () {
    var beforeChrismas = new Date(`12/01/${THISYEAR}`)
    var afterChrismas = new Date(`01/31/${parseInt(THISYEAR) + 1}`)
    if (TODAY >= beforeChrismas && TODAY <= afterChrismas) {
      $.fn.snow({
        minSize: 5,
        maxSize: 50,
        newOn: 500,
        flakeColor: '#FFFFFF'
      })
    }
  }

  loadChristmas()
})()
