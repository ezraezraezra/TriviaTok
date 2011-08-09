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
function tbtb(usr_token){

	var apiKey = 2663961;
	var sessionId = '27dc7c8de14a8bb2e4c77ecc5a7365aefa5a57b9';
	var token = usr_token;
	var session;
	var publisher;
	var subscribers = {};
	var allow_to_publish = 'false';
	var been_connected = 'false';
	var host_id = "";
	var player_id = "";
	var test_case = 'blah';
	var user_type;
	var all_connection_ids;
	var participating_ids = new Array();
	var ppl_watching = 0;
	this.getHost_id = function() { return host_id;}
	this.setHost_id = setHost_id;
	this.connect = connect;
	this.startPublishing = startPublishing;
	this.pickNextUser = pickNextUser;
	this.startNextUser = startNextUser;
	
	TB.addEventListener("exception", exceptionHandler);
	
	if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
		alert("You don't have the minimum requirements to run this application." +
		"Please upgrade to the latest version of Flash.");
	}
	else {
		session = TB.initSession(sessionId);
		session.addEventListener('sessionConnected', sessionConnectedHandler);
		session.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
		session.addEventListener('connectionCreated', connectionCreatedHandler);
		session.addEventListener('connectionDestroyed', connectionDestroyedHandler);
		session.addEventListener('streamCreated', streamCreatedHandler);
		session.addEventListener('streamDestroyed', streamDestroyedHandler);
		
		been_connected = 'true';
	}
	
	//--------------------------------------
	//  LINK CLICK HANDLERS
	//--------------------------------------
	
	
	function connect(type_user){
		user_type = type_user;
		if (been_connected == 'true') {
			session.connect(apiKey, token);
		}
		else {
			setTimeout(function(){
				connect(type_user);
			});
		}
		
	}
	
	function disconnect(){
		session.disconnect();
	}
	
	
	function startPublishing(user_type){
		if (allow_to_publish == 'true') {
			if (!publisher) {
				if (user_type == 'host') {
					var parentDiv = document.getElementById("camera_host_container");
				}
				else {
					var parentDiv = document.getElementById("camera_guest_container");
					player_id = session.connection.connectionId;
				}
				var publisherDiv = document.createElement('div');
				publisherDiv.setAttribute('id', 'opentok_publisher');
				parentDiv.appendChild(publisherDiv);
				var publisherProps = {
					width: 320,
					height: 240,
					publishAudio: true
				};
				publisher = session.publish(publisherDiv.id, publisherProps);
			}
		}
		else {
			setTimeout(function(){
				startPublishing(user_type);
			}, 1000);
		}
	}
	
	function stopPublishing(){
		if (publisher) {
			session.unpublish(publisher);
		}
		publisher = null;
	}
	
	//--------------------------------------
	//  OPENTOK EVENT HANDLERS
	//--------------------------------------
	
	function sessionConnectedHandler(event){
		if(user_type == 'host') {
			all_connection_ids = "";
			all_connection_ids = event.connections;
			
			host_id = session.connection.connectionId;
			ppl_watching += event.connections.length;
			checkConnectionAmount();
		}

		allow_to_publish = 'true';
		for (var i = 0; i < event.streams.length; i++) {
			addStream(event.streams[i]);
		}
	}
	
	function streamCreatedHandler(event){
		for (var i = 0; i < event.streams.length; i++) {
			addStream(event.streams[i]);
		}
	}
	
	function streamDestroyedHandler(event){
		if(user_type == 'host') {
			$("#kick_user").fadeOut('slow');
			$("#next_question").fadeOut('slow');
			if(ppl_watching >= 2) {
				$("#next_user").fadeIn('slow');
			}
		}
		
		//resetGame();
		if(user_type == 'host') {
			player_id = "";
			socket.emit('kick_user');
		}
		
	}
	
	function sessionDisconnectedHandler(event){
		publisher = null;
	}
	
	function connectionDestroyedHandler(event){
		if(user_type == 'host') {
			ppl_watching -= 1;
			if(ppl_watching <= 1) {
				$("#next_user").fadeOut('slow');
			}
			
			for (x = 0; x < event.connections.length; x++) {
				if (player_id == event.connections[x].connectionId) {
					player_id = "";
					socket.emit('kick_user');
				}
			}
		}
	}
	
	function connectionCreatedHandler(event){
		if(user_type == 'host') {
			all_connection_ids = event.connections;
			ppl_watching += event.connections.length;
			checkConnectionAmount();
		}
	}
	
	this.forceUnpublish = forceUnpublish;
	function forceUnpublish() {
		if(session.connection.connectionId == player_id) {
			stopPublishing();
		}
		
		//resetGame();
	}

	function checkConnectionAmount() {
		if(ppl_watching >= 2 && player_id == "") {
			$("#next_user").fadeIn('slow');
		}
	}
	
	
	function pickNextUser() {
		var id_found = false;
		var id_picked;
		var loop_counter = 0;
		
		while(id_found == false) {
			id_picked = all_connection_ids[Math.floor(Math.random() * all_connection_ids.length)].connectionId;
			
			if(host_id != id_picked) {
				id_found = true;
			}
			else {
				id_found = false;
			}
			
			
		}
		return id_picked;
	}
	
	
	function startNextUser(user_id) {
		if(session.connection.connectionId == user_id) {
			startPublishing();
			return true;
		}
		else {
			return false;
		}
	}
	
	function exceptionHandler(event){
		alert("Exception: " + event.code + "::" + event.message);
	}
	
	//--------------------------------------
	//  HELPER METHODS
	//--------------------------------------
	
	function addStream(stream){
		participating_ids.push(stream.connection.connectionId);
		if (stream.connection.connectionId == session.connection.connectionId) {
			return;
		}
		
		var subscriberDiv = document.createElement('div');
		subscriberDiv.setAttribute('id', stream.streamId);
		
		if(host_id == stream.connection.connectionId) {
			document.getElementById("camera_host_container").appendChild(subscriberDiv);
		}
		else {
			document.getElementById("camera_guest_container").appendChild(subscriberDiv);
			player_id = stream.connection.connectionId;
			if(user_type == 'host') {
				$("#next_question").fadeIn('slow');
				$("#kick_user").fadeIn('slow');
				$("#next_user").fadeOut('slow');
			}
		}
		var subscriberProps = {
			width: 320,
			height: 240,
			publishAudio: true
		};
		subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id, subscriberProps);
	}
	
	function show(id){
		document.getElementById(id).style.display = 'block';
	}
	
	function hide(id){
		document.getElementById(id).style.display = 'none';
	}
	
	function displayKickButton(user_amount) {
		if(user_type == 'host' && user_amount >= 2) {
			$("#kick_user").fadeIn('slow');
		}
		else {
		}
	}
	
	function getHostId() {
		if(test_case == "") {
			return false;	
		}
		else {
			return test_case;
		}
	}
	function setHost_id(set_id) {
		host_id = set_id;
	}
	
	function resetGame() {
		for(x = 1; x < 21; x++) {
			$("#score_"+x).css("background-color", "transparent");
			if(x < 5) {
				$("#solution_"+ (x - 1) + "_right").html("");
				$("#solution_" + (x - 1) + "_container").css("background-color", "#BFBB11").css("border-color", "#730046").css("color", "black");
			}
			$("#help_container_computer_normal").fadeIn('slow');
			$("#help_container_audience_normal").fadeIn('slow');
			$("#help_container_phone_normal").fadeIn('slow');
			if(user_type == 'host') {
				$("#correct_answer").html("");
			}
		}
		$("#actual_question").html("");
		$("#game_recap_container").fadeOut('slow');
	}
}