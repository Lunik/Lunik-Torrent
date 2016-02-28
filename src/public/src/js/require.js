var DEF = {}
function require (url) {
  if (!DEF[url]) {
    $.ajax({
      url: url,
      async: false,
      dataType: 'script',
    })
    DEF[url] = true
  }
}
