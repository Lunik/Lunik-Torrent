var DEFAULTPATH = __dirname+"/public/downloads/";
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

var TorrentUrlToChild = {};
var TorrentHashToChild = {};
var TorrentWaitList = [];

io.on('connection', function (socket) {

	socket.on('ready',function(){
		for(var key in TorrentHashToChild){
			TorrentHashToChild[key].send({'type':"info"});
		}

		socket.on('download-t',function(url){
			startTorrent(url);
		});
	});
	
	socket.on('list-d',function(dir){
		fs.readdir(DEFAULTPATH+dir, function(err, files){
			if(err) return log(err);
	    	var list = {};
	    	if(files.length > 0){
		    	files.forEach(function(file){
		    		stats = fs.statSync(DEFAULTPATH+dir+file);
		    		if(stats.isFile()){
		    			list[file] = stats;
		    		} else {
		    			stats.size = sizeRecursif(DEFAULTPATH+dir+file);
		    			list[file] = stats;
		    		}
		    		list[file].isfile = stats.isFile();
		    		list[file].isdir = stats.isDirectory();

		    		if(Object.keys(list).length == files.length){
		    			socket.emit('list-d',list);
		    		}
		    	});
		    } else {
		    	socket.emit('list-d',{});
		    }
		});
	});

	socket.on('remove-t',function(hash){
		log('Remove torrent: '+hash);
		TorrentHashToChild[hash].send({'type': "remove"});
		socket.emit('finish-t',hash);
	});

	socket.on('remove-d',function(file){
		log("Remove file: "+file);
		fs.stat(DEFAULTPATH+file, function(err, stats){
			if(err) return log(err);
			if(stats.isDirectory()){
				removeRecursif(DEFAULTPATH+file);
				socket.emit('update-d');
			} else {
				fs.unlink(DEFAULTPATH+file, function(err){
  					if(err) return log(err);
					socket.emit('update-d');
				});
			}
		});
	});

	socket.on('rename-d',function(data){
		log("Rename: "+data.oldname+" In: "+data.newname);
		fs.rename(DEFAULTPATH+data.path+"/"+data.oldname, DEFAULTPATH+data.path+"/"+data.newname, function(err){
			if(err) return log(err);
			socket.emit('update-d');
		});
	});

	socket.on('mkdir',function(data){
		log('Mkdir: '+data.path+"/"+data.name);
		fs.mkdir(DEFAULTPATH+data.path+"/"+data.name, function(){
			socket.emit('update-d');
		});
	});

	socket.on('mv',function(data){
		console.log(data);
		fs.rename(DEFAULTPATH+data.path+data.file, DEFAULTPATH+data.path+data.folder+"/"+data.file,function(err){
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

function startTorrent(url){
	log('Trying to download: '+url);
			
	//evite de lancer deux fois le meme torrent
	if(TorrentUrlToChild[url] == null){
		//Si trop de torrent en cours
		if(Object.keys(TorrentUrlToChild).length < 5){
			var n = cp.fork(__dirname + '/tclient.js');
			TorrentUrlToChild[url] = n;
			n.on('message',function(data){
				switch(data.type){
					case 'finish':
						io.sockets.emit('finish-t',data.hash);
						n.kill('SIGHUP');
						delete TorrentUrlToChild[url];
						delete TorrentHashToChild[data.hash];

						//Relance un torrent si il y en a en attente
						if(TorrentWaitList.length > 0){
							var newUrl = TorrentWaitList[0];
							startTorrent(newUrl);
							TorrentWaitList.shift();
						}
						break;
					case 'info':
						io.sockets.emit('list-t',data.torrent);
						TorrentHashToChild[data.torrent.hash] = n;
						break;
				}
			});

			n.send({'type': "download", 'torrent': url});

			} else {
				log("Too much client. Adding torrent to the waitlist.")
				//On push dans la liste d'attente
				if(TorrentWaitList.indexOf(url) == -1)
					TorrentWaitList.push(url);
			}
		} else {
			log("Torrent is already downloading.");
		}
	}


function removeRecursif(path){
	if(fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file,index){
	    	var curPath = path + "/" + file;
	    	if(fs.lstatSync(curPath).isDirectory()) { // recurse
	        	removeRecursif(curPath);
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
