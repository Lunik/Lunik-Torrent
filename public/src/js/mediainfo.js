function mediaInfoGet(title){
  var type = getMediaType(title)
  title = cleanTitle(title)
  if(readData(title.toLowerCase()) != null){
    mediaInfoPopup(readData(title.toLowerCase()))
  } else {
    socket.emit('infos-d', {type:type, query:title})
  }
}

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
  p.init(null,null,null,null,html.title,html.content,true)
  p.draw()
}

function cleanTitle(title){
  title = title.replace(/\.[A-Za-z0-9]*$/,'') //remove extension
  .replace(/S[0-9^E]*E[0-9]*/, '') //numero d'episode
  .replace(/[ \.](([Ff][Rr])|([Vv][Oo])|(VOSTFR)|(FASTSUB)|(HDTV)|(XviD-ARK01))/g, '') //remove useless stuff
  .replace(/\./g,' ') //point
  .replace(/ $/,''); //espace en fin de chaine

  return title
}

function getMediaType(title){
  var regex = /S[0-9^E]*E[0-9]/
  if(title.search(regex) == -1){
    return 'films'
  } else {
    return 'series'
  }
}
