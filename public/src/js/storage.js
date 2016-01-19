/////////////////
//  localStorage
/////////////////

//Sauvgarder des donnes dans le localStorage
function storeData(key,data){
	data = JSON.stringify(data);
	localStorage.setItem(key,data);
}

//Lire des donnes dans le localStorage
function readData(key){
	var data = localStorage.getItem(key);
	return JSON.parse(data);
}

//Effacer le localStorage
function clearData(){
	localStorage.clear();
}

//Affacer un localStorage precis
function clearKey(key){
	localStorage.setItem(key,null);
}

//Recupere toutes les clefs
function getAllKey(){
	var keys = [];
	for (var key in localStorage){
		keys.push(key);
	}
	return keys;
}

//Recup toutes les datas
function getAllData(){
	var keys = getAllKey();
	var data = {};
	for (var key in keys){
		key = keys[key];
		data[key] = readData(key);
	}
	return data;
}