$(window).keydown(function (event) {
  switch (event.which) {
    case 13:
      $currentSubmit.trigger('click')
      break
  }
})
