function require(url){
  $.ajax({
    url: url,
    async: false,
    dataType: "script",
  });
}
