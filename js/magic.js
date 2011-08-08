/*
 * Project: TriviaTok
 * Description: Video-based trivia game showcasing the OpenTok API and crowd-source questions
 * 
 * Author: Ezra Velazquez
 * Website: http://ezraezraezra.com
 * Date: August 2011
 */
var socket;

/*
 * MAIN FUNCTION TO ACCESS JS
 */
function loadTrivaGame(usr_type, usr_token){
	var user_type = usr_type;
	var question_counter = 0;
	var MAX_QUESTIONS = 20;
	var trivia_questions;
	var display_question = new Array();
	
	var allow_trivia_clicks = false;
	var user_answer;
	var tokbox = new tbtb(usr_token);
	var answer;
	
	$(document).ready(function(){
		tokbox.connect(user_type);
		connectToServer(user_type);
		
		if (user_type == 'host') {
			shareHostId();
			loadQuestions(MAX_QUESTIONS);
			loadButtonEventHandlers('admin');
			tokbox.startPublishing('host');
		}
		else {
			$("#input_question_container").css("display", "block");
			$("#user_container").fadeIn('slow');
			$("#input_submit_button").click(function(){
				validateQuestion();
			});
			getHostId();
		}
	})
	
	// Set up websockets to listen and talk to server
	function connectToServer(user_type){
		socket = io.connect('http://triviatok.opentok.com:8004');
		socket.on('start', function(data){
		});
		socket.on('question', function(data){
			presentQuestion(data);
			if (user_type == 'user') {
				allow_trivia_clicks = true;
			}
		});
		socket.on('user_answer', function(data){
			if (user_type != 'user') {
				user_answer = data.user_answer.answer;
				showUserAnswer();
			}
		});
		socket.on('correct_answer', function(data){
			$("#solution_" + data.correct_answer.response + "_container").css("background-color", "green");
			updateScoreboard(data.correct_answer.question_number, data.correct_answer.point);
			if (user_type == 'host') {
				if (question_counter < MAX_QUESTIONS) {
					$("#reveal_answer").fadeOut('slow', function(){
						$("#next_question").fadeIn("slow");
					});
				}
				else {
					var total_score = 0;
					for (var x = 1; x < 21; x++) {
						if ($("#score_" + x).css("background-color") == 'rgb(0, 128, 0)') {
							total_score += 1;
						}
					}
					setTimeout(function() {
						socket.emit('game_over', {
						score: total_score
						});
					},4000);
				}
			}
		});
		socket.on('help selected', function(data){
			if (data.help.help == "twilio") {
				$("#help_container_phone_normal").fadeOut("slow");
			}
			if (data.help.help == "twitter") {
				$("#help_container_audience_normal").fadeOut('slow');
			}
			if (data.help.help == "computer") {
				$("#help_container_computer_normal").fadeOut("slow", function(){
					removeAnswers(data);
				});
			}
		});
		socket.on('host id', function(data){
			if (user_type != 'host') {
				tokbox.setHost_id(data.host_id);
			}
		});
		socket.on('kick_user', function(){
			resetGame();
		});
		socket.on('next_user', function(data){
			var me_playing = tokbox.startNextUser(data.next_user.id);
			if (me_playing == true) {
				allow_trivia_clicks = true;
				user_type = "user";
				loadButtonEventHandlers('user');
			}
		});
		socket.on('game_over', function(data) {
			var fb_message ="";
			$("#game_recap_score_container").html(data.score.score + "/20");
			
			$("#game_recap_container").fadeIn('slow',function() {
				if(user_type == 'user') {
					fb_message = "Just scored "+ data.score.score +" out of 20 on TriviaTok";
				}
				else {
					fb_message = "Check out TriviaTok, I might play next round!";
				}
				$("#game_recap_facebook").click(function() {
					FB.ui({ method: 'feed', message: fb_message });
				});
				$("#game_recap_twitter").click(function() {
					window.open("http://twitter.com/share?url=http://trivia.opentok.com&text="+fb_message, "_blank", 'width=200,height=200,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no');
				});
			});
			setTimeout(resetGame, 9000);
		});
	}
	
	// Add event handlers based on user-type
	function loadButtonEventHandlers(button_type){
		switch (button_type) {
			case 'admin':
				$("#next_question").click(function(){
					orderOfDisplay(trivia_questions.questions[question_counter]);
					question_counter += 1;
					$("#next_question").fadeOut("slow");
				});
				$("#reveal_answer").click(function(){
					$("#reveal_answer").fadeOut('slow');
					
					//		score appropriately, and show everyone
					if (user_answer == display_question[5]) {
						var score = 'yes';
					}
					else {
						var score = 'no';
					}
					socket.emit('correct_response', {
						response: display_question[5],
						question_number: (question_counter),
						point: score
					});
				});
				$("#kick_user").click(function(){
					socket.emit('kick_user');
				});
				$("#next_user").click(function(){
					var next_user = tokbox.pickNextUser();
					socket.emit('next_user', {
						id: next_user
					});
				});
				$("#moderate_questions").click(function() {
					$("#mod_questions_container").fadeIn('slow');
					$("#moderate_questions").fadeOut('slow', function() {
						$("#game_view").fadeIn('slow');
					});
					getDirtyQuestion();
				});
				$("#game_view").click(function() {
					$("#mod_questions_container").fadeOut('slow');
					$("#game_view").fadeOut('slow', function() {
						$("#moderate_questions").fadeIn('slow');
					});
				});
				break;
			case 'user':
				$(".question_holder").click(function(){
					if (allow_trivia_clicks == true) {
						//alert("User clicked" + $(this).attr("id"));
						allow_trivia_clicks = false;
						$(this).css("background-color", "#730046");
						socket.emit('user_answer', {
							answer: $(this).attr("id").substring(9, 10)
						});
					}
				});
				$(".question_holder").mouseenter(function(){
					if (allow_trivia_clicks == true) {
						$(this).css("background-color", "#730046");
						$(this).css("color", "#DCDCDC");
					}
				});
				$(".question_holder").mouseleave(function(){
					if (allow_trivia_clicks == true) {
						$(this).css("background-color", "#BFBB11");
						$(this).css("color", "black");
					}
				});
				$("#help_container_audience_normal").click(function(){
					//console.log("I am a "+ user_type);
					if (allow_trivia_clicks == true) {
						window.open("http://twitter.com/share?url=http://trivia.opentok.com&text=Help me solve the trivia question", "_blank", 'width=200,height=200,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no');
						socket.emit('help selected', {
							help: "twitter"
						});
					}
				});
				$("#help_container_phone_normal").click(function(){
					if (allow_trivia_clicks == true) {
						//console.log("phone clicked");
						$("#twilio_container").fadeIn('slow', function(){//});
							//$("#help_container").fadeOut('slow', function(){
							socket.emit('help selected', {
								help: "twilio"
							});
						});
					}
				});
				$("#help_container_computer_normal").click(function(){
					if (allow_trivia_clicks == true) {
						//console.log('comp clicked');
						var random_array = new Array();
						random_array[0] = 0;
						random_array[1] = 1;
						random_array[2] = 2;
						random_array[3] = 3;
						random_array.sort(function(){
							return 0.5 - Math.random()
						});
						
						socket.emit('help selected', {
							help: "computer",
							random_numbers: random_array
						});
					}
				});
				break;
		}
	}
	
	// Validate user-submitted question form and update related-visuals as necessary
	function validateQuestion() {
		var valid_entry = true;
		$("#form_question_label").css("color", "black");
		$("#form_answer_label").css("color", "black");
		$("#form_false_label").css("color", "black");
		
		if(($("#form_false_input_3").val() == "")) {
			valid_entry = false;
			$("#form_false_label").css("color", "red");
			$("#form_false_input_3").focus();
		}
		if(($("#form_false_input_2").val() == "")) {
			valid_entry = false;
			$("#form_false_label").css("color", "red");
			$("#form_false_input_2").focus();
		}
		if(($("#form_false_input_1").val() == "")) {
			valid_entry = false;
			$("#form_false_label").css("color", "red");
			$("#form_false_input_1").focus();
		}
		if($("#form_answer_input").val() == "") {
			valid_entry = false;
			$("#form_answer_label").css("color", "red");
			$("#form_answer_input").focus();
		}
		if($("#form_question_input").val() == "") {
			valid_entry = false;
			$("#form_question_label").css("color", "red");
			$("#form_question_input").focus();
		}
		if (valid_entry == true) {
			$("#thanks_crowd_input").fadeIn("slow", function() {
				$("#form_question_input").val("");
				$("#form_answer_input").val("");
				$("#form_false_input_1").val("");
				$("#form_false_input_2").val("");
				$("#form_false_input_3").val("");
				setTimeout(function() {$("#thanks_crowd_input").fadeOut("slow");}, 5000);
			});
			
			$.getJSON('php/back.php', {
				comm: 'input_question',
				trivia_question: $("#form_question_input").val(),
				trivia_answer: $("#form_answer_input").val(),
				trivia_false_1: $("#form_false_input_1").val(),
				trivia_false_2: $("#form_false_input_2").val(),
				trivia_false_3: $("#form_false_input_3").val()
				}, function(data) {
			});
		}
		else {
		}
	}
	
	// Get and display unapproved questions
	function getDirtyQuestion() {
		$("#mod_question").html("Loading triva question...");
		$.get('php/back.php', {
			comm: 'dirty_question'
		}, function(data) {
			if (data.status == '400') {
				$("#mod_question").html("No questions left to moderate.<br/>Thanks to the community for helping out.");
			}
			else {
				var q_id = data.question.q_id;
				$("#mod_question").html(data.question.question);
				$("#mod_solution_0").html(data.question.solution);
				$("#mod_solution_1").html(data.question.false_one);
				$("#mod_solution_2").html(data.question.false_one);
				$("#mod_solution_3").html(data.question.false_two);
				
				$("#mod_button_container").fadeIn('slow', function(){
					$(".mod_buttons").click(function(){
						var clean_status;
						var reponse;
						if ($(this).attr("id") == 'mod_reject_button') {
							clean_status = 3;
							response = "Question rejected. Getting next question.<br/>Thanks for helping out";
						}
						else {
							clean_status = 1;
							response = "Question accepted. Getting next question.<br/>Thanks for helping out";
						}
						
						$.get('php/back.php', {
							comm: 'update_question',
							q_id: q_id,
							clean_status: clean_status
						}, function(data){
							$("#mod_question").html(response);
							$("#mod_solution_0").html("");
							$("#mod_solution_1").html("");
							$("#mod_solution_2").html("");
							$("#mod_solution_3").html("");
							$("#mod_button_container").fadeOut('slow');
							setTimeout(getDirtyQuestion, 3500);
						});
					});
					
				});
			}
		});
	}
	
	// Display question on trivia board
	function presentQuestion(obj){
		var int_to_string;
		$("#actual_question").html(obj.the_questions.the_question[4]);
		answer = obj.the_questions.the_question[5];
		for (x = 0; x < 4; x++) {
			$("#solution_" + x + "_right").html(obj.the_questions.the_question[x]).fadeIn('slow');
			$("#solution_" + x + "_container").css("background-color", "#BFBB11").css("border-color", "#730046").css("color", "black");
		}
		if (user_type == 'host') {
			switch (obj.the_questions.the_question[5]) {
				case 0:
					int_to_string = "A";
					break;
				case 1:
					int_to_string = "B";
					break;
				case 2:
					int_to_string = "C";
					break;
				case 3:
					int_to_string = "D";
					break;
				default:
					int_to_string = "-";
			}
			$("#correct_answer").html(int_to_string);
		}
	}
	
	// Randomly choose order of questions
	function orderOfDisplay(obj){
		var correct_answer = Math.floor(Math.random() * 4);
		for (var x = 0; x < 6; x++) {
			display_question[x] = 'empty';
		}
		display_question[correct_answer] = obj.solution;
		display_question[4] = obj.question;
		display_question[5] = correct_answer;
		
		placeResponeses(obj.false_one);
		placeResponeses(obj.false_two);
		placeResponeses(obj.false_three);
		
		socket.emit('question', {
			the_question: display_question
		});
		
		// Order of display for questions (for random effect)
		function placeResponeses(string_to_place){
			var empty_space = true;
			var empty_space_counter = 0;
			while (empty_space == true) {
				if (display_question[empty_space_counter] == 'empty') {
					empty_space = false;
					display_question[empty_space_counter] = string_to_place;
				}
				else {
					empty_space_counter += 1;
				}
			}
		}
	}
	
	// Reset variables and clean gameboard
	function resetGame() {
		tokbox.forceUnpublish();
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
			if(user_type == 'user') {
				$(".question_holder").unbind('click');
				$("#help_container_phone_normal").unbind('click');
				$("#help_container_audience_normal").unbind('click');
				$("#help_container_computer_normal").unbind('click');
				user_type = "viewer";
				
			}
		}
		if(user_type == 'host') {
			question_counter = 0;
			trivia_questions = [];
			display_question = [];
			loadQuestions(MAX_QUESTIONS);
		}
		$("#actual_question").html("");
		$("#game_recap_container").fadeOut('slow');
	}
	
	/*
	 * HELPER FUNCTIONS
	 */
	
	// Broadcast host's ID
	function shareHostId(){		
		if (tokbox.getHost_id.call() != "") {
			socket.emit('host_id', {
				host_id: tokbox.getHost_id.call()
			});
		}
		else {
			setTimeout(function(){
				shareHostId();
			}, 1000);
		}
		
	}
	
	// Get host's TokBox connection ID
	function getHostId(){
		socket.emit('get host_id');
	}
	
	// Get trivia questions from the server
	function loadQuestions(q_amount){
		$.getJSON('php/back.php', {
			comm: 'live_questions',
			user_type: user_type,
			amount_type: q_amount
		}, function(data){
			trivia_questions = data;
			$("#admin_container").css("display", "block");
			$("#user_container").fadeIn('slow');
		});
	}
	
	// 50/50 display algorithm
	function removeAnswers(data){
		var remove_counter = 0;
		var remove_index = 0;
		while (remove_counter < 2) {
			if (data.help.random_numbers[remove_index] != answer) {
				$("#solution_" + data.help.random_numbers[remove_index] + "_right").fadeOut("slow");
				remove_counter += 1;
			}
			remove_index += 1;
		}
	}
	
	// Display the participant's answer
	function showUserAnswer(){
		$("#solution_" + user_answer + "_container").css("background-color", "#730046");
		$("#solution_" + user_answer + "_container").css("color", "#DCDCDC");
		if (user_type == 'host') {
			$("#reveal_answer").fadeIn('slow');
		}
	}
	
	// Update scoreboard locally
	function updateScoreboard(q_num, point){
		if (point == 'yes') {
			var s_color = 'green';
		}
		else {
			var s_color = 'red';
		}
		$("#score_" + q_num).css("background-color", s_color);
	}
}