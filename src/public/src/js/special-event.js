;(function () {
  function loadChristmas () {
    var beforeChrismas = new Date('12/01/' + (new Date()).getFullYear())
    var afterChrismas = new Date('01/31/' + parseInt((new Date()).getFullYear() + 1))
    var currentDate = (new Date())
    if (currentDate >= beforeChrismas && currentDate <= afterChrismas) {
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
