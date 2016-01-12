$(window).keydown(function (event) {
  console.log(event.which)
  switch (event.which) {
    case 13:
      $currentSubmit.trigger('click')
      break
    case 27:
      $searchResultTable.html('')
      break
  }
})
