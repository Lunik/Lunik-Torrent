setInterval(list, 1000);
list();
function list(){
	socket.emit('list');
}