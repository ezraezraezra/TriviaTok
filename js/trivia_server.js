/*
 * Project:     TriviaTok
 * Description: Video-based trivia game showcasing the OpenTok API and crowdsourced questions
 * Website:     http://triviatok.opentok.com
 * 
 * Author:      Ezra Velazquez
 * Website:     http://ezraezraezra.com
 * Date:        August 2011
 * 
 */
var io = require('socket.io').listen(8004);
var host_id = "";

console.log("server on");

io.sockets.on('connection', function (socket) {
	
	socket.emit('start', {message: "connected to server" });
	
	socket.on('private_data', function (data) {
		socket.emit('public_data', { product : data });
		socket.broadcast.emit('public_data', {product : data });
	});
	
	socket.on('question', function(data) {
		socket.emit('question', { the_questions: data});
		socket.broadcast.emit('question', { the_questions: data});
	});
	
	socket.on('user_answer', function(data) {
		socket.emit('user_answer', { user_answer: data});
		socket.broadcast.emit('user_answer', { user_answer: data});
	});
	
	socket.on('correct_response', function(data) {
		socket.emit('correct_answer', { correct_answer: data});
		socket.broadcast.emit('correct_answer', { correct_answer: data});
	});
	
	socket.on('help selected', function(data) {
		socket.emit('help selected', { help: data});
		socket.broadcast.emit('help selected', { help: data});
	});
	
	socket.on('host_id', function(data) {
		host_id = data.host_id;
		socket.emit('host id', { host_id: host_id});
		socket.broadcast.emit('host id', { host_id: host_id});
	});
	
	socket.on('get host_id', function(data) {
		socket.emit('host id', { host_id: host_id});
		socket.broadcast.emit('host id', { host_id: host_id});
	});
	
	socket.on('kick_user', function(data) {
		socket.emit('kick_user');
		socket.broadcast.emit('kick_user');
	});
	
	socket.on('next_user', function(data) {
		socket.emit('next_user', { next_user: data});
		socket.broadcast.emit('next_user', { next_user: data});
	});
	
	socket.on('game_over', function(data) {
		socket.emit('game_over', { score: data });
		socket.broadcast.emit('game_over', { score: data });
	});
});