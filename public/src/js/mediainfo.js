function mediaInfoHtml(data) {
  var html = {};
  html.title = $('<a/>').attr('href', data.link).text(data.title);

  $html = $('<div/>').addClass('Content');

  $image = $('<img/>').attr('src', data.poster).attr("alt", data.title + " poster");
  $html.append($image);

  $infos = $('<div/>').addClass('infos');

  $rating = $('<div/>').addClass('rating').text(Math.round(data.rating) + "/5");
  $infos.append($rating);

  $synopsis = $('<div/>').addClass('synopsis').text(data.description);
  $lirelasuite = $('<br><a/>').attr('target', "_blank").attr('href', data.link).text("Fiche Allocine...");
  $synopsis.append($lirelasuite);
  $infos.append($synopsis);

  $html.append($infos);

  html.content = $html;
  return html;
}

function mediaInfoPopup(data){
  var p = new Popup()
  var html = mediaInfoHtml(data);
  console.log(html)
  p.init(null,null,null,null,html.title,html.content,true)
  p.draw()
}
