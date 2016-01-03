// Setup basic express server
var auth = require('http-auth');
var basic = auth.basic({
	realm: "Protected area. Please disperse !",
	file: __dirname+"/.htpasswd"
});

//file management
var fs = require('fs');
fs.writeFile("log.txt", "",'utf-8', function(err){
	if(err) throw err;
});

var cp = require('child_process');


//setup http server
var express = require('express');
var app = express();
var server = require('http').createServer(basic,app);
var port = process.env.PORT || 80;

server.listen(port, function () {
  log('Server listening at port '+port);
});
// Routing
app.use(express.static(__dirname + '/public'));

//socket io
var io = require('socket.io')(server);

//webtorrent
var WebTorrent = require('webtorrent');
var client = new WebTorrent();

var parseTorrent = require('parse-torrent');

var Childs = [];
var TorrentTable = {};
var TorrentWaitList = [];

io.on('connection', function (socket) {

	socket.on('download-t',function(url){
		startTorrent(url);
	});

	function startTorrent(url){
		log('Trying to download: '+url);
		var hash = parseTorrent(url).infoHash;
		log("Hash: "+hash)
			
		//evite de lancer deux fois le meme torrent
		if(TorrentTable[hash] == null){
			//Si trop de torrent en cours
			if(Childs.length < 5){
				var n = cp.fork(__dirname + '/tclient.js');
				TorrentTable[hash] = n;
				Childs.push(n);
				n.on('message',function(data){
					switch(data.type){
						case 'finish':
							socket.broadcast.emit('finish-t');
							socket.emit('finish-t',data.hash);
							n.kill('SIGHUP');
							delete Childs[Childs.indexOf(n)];
							delete TorrentTable[hash];

							//Relance un torrent si il y en a en attente
							if(TorrentWaitList.length > 0){
								var newUrl = TorrentWaitList[0];
								startTorrent(newUrl);
								TorrentWaitList.shift();
							}
							break;
						case 'info':
							socket.broadcast.emit('list-t',data.torrent);
							socket.emit('list-t',data.torrent);
							break;
					}
				});

				n.send({'type': "download", 'torrent': url});

				} else {
					//On push dans la liste d'attente
					if(TorrentWaitList.indexOf(url) == -1)
						TorrentWaitList.push(url);
				}
			}
	}

	socket.on('list-t',function(){
		Childs.forEach(function(client){
			client.send({'type':"info"});
		});	
	});

	socket.on('list-d',function(dir){
		fs.readdir(__dirname+"/public/downloads/"+dir, function(err, files){
			if(err) return log(err);
	    	var list = {};
	    	if(files.length > 0){
		    	files.forEach(function(file){
		    		fs.stat(__dirname+"/public/downloads/"+dir+file,function(err, stats){
		    			if(err) return log(err);
		    			if(stats.isFile()){
		    				list[file] = stats;
		    			} else {
		    				stats.size = sizeRecursif(__dirname+"/public/downloads/"+dir+file);
		    				list[file] = stats;
		    			}
		    			list[file].isfile = stats.isFile();
		    			list[file].isdir = stats.isDirectory();

		    			if(Object.keys(list).length == files.length){
		    				socket.emit('list-d',list);
		    			}
		    		});
		    	});
		    } else {
		    	socket.emit('list-d',{});
		    }
		});
	});

	socket.on('remove-t',function(hash){
		log('Remove torrent: '+hash);
		client.remove(hash, function (err) {
			if(err) return log(err);
		});
		socket.emit('update-t');
	});

	socket.on('remove-d',function(file){
		log("Remove file: "+file);
		fs.stat(__dirname+"/public/downloads/"+file, function(err, stats){
			if(err) return log(err);
			if(stats.isDirectory()){
				removeRecursif(__dirname+"/public/downloads/"+file);
				socket.emit('update-d');
			} else {
				fs.unlink(__dirname+"/public/downloads/"+file, function(err){
  					if(err) return log(err);
					socket.emit('update-d');
				});
			}
		});
	});

	socket.on('rename-d',function(data){
		log("Rename: "+data.oldname+" In: "+data.newname);
		fs.rename(__dirname+"/public/downloads/"+data.path+"/"+data.oldname, __dirname+"/public/downloads/"+data.path+"/"+data.newname, function(err){
			if(err) return log(err);
			socket.emit('update-d');
		});
	});

});


function log(text){
	console.log(text);
	fs.appendFile("log.txt", text+"\n", 'utf8', function(err){
		if(err) throw err;
	});
}

function removeRecursif(path){
	if(fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file,index){
	    	var curPath = path + "/" + file;
	    	if(fs.lstatSync(curPath).isDirectory()) { // recurse
	        	deleteFolderRecursive(curPath);
	     	} else { // delete file
	        	fs.unlinkSync(curPath);
	      	}
	    });
	    fs.rmdirSync(path);
  	}
}

function sizeRecursif(path){
	var size = 0;
	if(fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file,index){
	    	var curPath = path + "/" + file;
	    	if(fs.lstatSync(curPath).isDirectory()) { // recurse
	        	sizeRecursif(curPath);
	     	} else { // read size
	        	size += fs.statSync(curPath).size;
	      	}
	    });
	    return size;
  	}
}
