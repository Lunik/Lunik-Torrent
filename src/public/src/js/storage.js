// ///////////////
//  localStorage
// ///////////////

function _Storage(){}
// Sauvgarder des donnes dans le localStorage
_Storage.prototype.storeData = function(key, data) {
  data = JSON.stringify(data)
  localStorage.setItem(key, data)
}

// Lire des donnes dans le localStorage
_Storage.prototype.readData = function(key) {
  var data = localStorage.getItem(key)
  return JSON.parse(data)
}

// Effacer le localStorage
_Storage.prototype.clearData = function() {
  localStorage.clear()
}

// Affacer un localStorage precis
_Storage.prototype.clearKey = function(key) {
  localStorage.setItem(key, null)
}

// Recupere toutes les clefs
_Storage.prototype.getAllKey = function() {
  var keys = []
  for (var key in localStorage) {
    keys.push(key)
  }
  return keys
}

// Recup toutes les datas
_Storage.prototype.getAllData = function() {
  var keys = getAllKey()
  var data = {}
  for (var key in keys) {
    key = keys[key]
    data[key] = readData(key)
  }
  return data
}
