<?php
include 'library/Services/Twilio/Capability.php';
include 'library/sdk/OpenTokSDK.php';
/*
 * Project:     TriviaTok
 * Description: Video-based trivia game showcasing the OpenTok API and crowdsourced questions
 * Website:     http://triviatok.opentok.com
 * 
 * Author:      Ezra Velazquez
 * Website:     http://ezraezraezra.com
 * Date:        August 2011
 * 
 * Notes:       Beetle Bus goes Jamba Juice, 1435983
 */

// App setup
$user_type = $_GET['user_type'];
if($user_type != 'host') {
	$user_type = 'viewer';
}

// Twilio setup
$accountSid = 'ACaf35b650b84b63b5a98211027e1eb294';
$authToken  = 'beb56837b04270e50332ef1fb3c134f7';
$appSid     = 'APfc81e6c49222611d027e759e46628921';

$capability = new Services_Twilio_Capability($accountSid, $authToken);
$capability->allowClientOutgoing($appSid);
$capability->allowClientIncoming('jenny');
$token = $capability->generateToken();


// TokBox setup
$a = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);
$token_tb = $a->generate_token('27dc7c8de14a8bb2e4c77ecc5a7365aefa5a57b9', RoleConstants::MODERATOR);
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<!-- 
 _____    _       _     _____     _    
|_   _|  (_)     (_)   |_   _|   | |   
  | |_ __ ___   ___  __ _| | ___ | | __
  | | '__| \ \ / / |/ _` | |/ _ \| |/ /
  | | |  | |\ V /| | (_| | | (_) |   < 
  \_/_|  |_| \_/ |_|\__,_\_/\___/|_|\_\
                                       
 -->
<meta name="description" content="Live video stream to play trivia" />
<meta name="keywords" content="OpenTok TokBox Twilio Trivia Social" />
<meta name="author" content="Ezra Velazquez" />
<link rel=stylesheet href="css/layout.css" type="text/css">
<link rel=stylesheet href="css/float_panel.css" type="text/css">
<script type="text/javascript" src="js/jquery-1.5.1.min.js"></script>
<script src="http://static.opentok.com/v0.91/js/TB.min.js" ></script>
<script type="text/javascript" src="library/io/dist/socket.io.js"></script>
<script type="text/javascript" src="http://static.twilio.com/libs/twiliojs/1.0/twilio.min.js"></script>
<script type="text/javascript" src="js/tw.js"></script>
<script type="text/javascript" src="js/tb.js"></script>
<script type="text/javascript" src="js/magic.js"></script>
<script type="text/javascript">
	loadTwilio(<?php echo "'".$token."'"; ?>);
	loadTrivaGame(<?php echo "'".$user_type."','".$token_tb."'";?>);
</script>
<title>TriviaTok!</title>
</head>
<body>
	<div id="body_container">
	<div id="game_title">triviatok</div>
		<div id="gameshow_container">
			<div id="game_recap_container">
				<div id="game_recap_header">GAME RECAP</div>
				<div id="game_recap_score_container">20/20</div>
				<div id="game_recap_social_container">
					SHARE
					<div id="game_recap_twitter" class="game_recap_buttons">twitter</div>
					<div id="game_recap_facebook" class="game_recap_buttons">facebook
						<div id="fb-root"></div>
						<script src="http://connect.facebook.net/en_US/all.js"></script>
						<script>
							FB.init({
								appId:'240868755947208', cookie:true, status:true, xfbml:true
							});
						</script>
					</div>
				</div>
				<div id="game_recap_waiting"></div>
			</div>
			<div id="mod_questions_container">
				<div id="mod_title">MODERATE TRIVIA QUESTIONS</div>
				<div id="mod_question">Question Goes here</div>
				<div id="mod_solution_container">
					<div id="mod_solution_0" class="mod_solution">Correct Answer</div>
					<div id="mod_solution_1" class="mod_solution">Bad Answer</div>
					<div id="mod_solution_2" class="mod_solution">Bad Answer</div>
					<div id="mod_solution_3" class="mod_solution">Bad Answer</div>
				</div>
				<div id="mod_button_container">
					<div id="mod_reject_button" class="admin_buttons mod_buttons">REJECT QUESTION</div>
					<div id="mod_accept_button" class="admin_buttons mod_buttons">ACCEPT QUESTION</div>
				</div>
			</div>
			<div id="gameshow_container_inner">
			<div id="gameshow_top_container">
				<div id="camera_host_container" class="camera_container"></div>
				<div id="questions_correct_container">
					<div id="score_17" class="score"></div>
					<div id="score_18" class="score"></div>
					<div id="score_19" class="score"></div>
					<div id="score_20" class="score"></div>
					<div id="score_13" class="score"></div>
					<div id="score_14" class="score"></div>
					<div id="score_15" class="score"></div>
					<div id="score_16" class="score"></div>
					<div id="score_9" class="score"></div>
					<div id="score_10" class="score"></div>
					<div id="score_11" class="score"></div>
					<div id="score_12" class="score"></div>
					<div id="score_5" class="score"></div>
					<div id="score_6" class="score"></div>
					<div id="score_7" class="score"></div>
					<div id="score_8" class="score"></div>
					<div id="score_1" class="score"></div>
					<div id="score_2" class="score"></div>
					<div id="score_3" class="score"></div>
					<div id="score_4" class="score"></div>
					<div id="questions_correct_title">QUESTIONS CORRECT</div>
				</div>
				<div id="camera_guest_container" class="camera_container"></div>
			</div>
			<div id="gameshow_bottom_container">
				<div id="gameshow_bottom_left">
					<div id="help_container">
						<div id="help_container_title" class="help_container_choices"><span id="h_c_c_t">GET</span><br/>HELP</div>
						<div id="help_container_phone" class="help_container_choices">
							<div id="help_container_phone_normal"" class="help_container_choices">
								<div id="help_container_phone_hover" class="help_container_choices"></div>
							</div>
						</div>
						<div id="help_container_audience" class="help_container_choices">
							<div id="help_container_audience_normal" class="help_container_choices">
								<div id="help_container_audience_hover" class="help_container_choices"></div>
							</div>
						</div>
						<div id="help_container_computer" class="help_container_choices">
							<div id="help_container_computer_normal" class="help_container_choices">
								<div id="help_container_computer_hover" class="help_container_choices"></div>
							</div>
						</div>
					</div>
					<div id="twilio_container">
						<div id="log">Loading pigeons...</div>
						<div id="twilio_timer">Time Left 0:30</div>
						<input type="text" id="number" name="number" placeholder="Enter a phone number to call"/>
						<div class="call" id="call">call</div>
 						<!-- <div class="hangup" id="hangup" onclick="hangup();">Hangup</div> -->
					</div>
				</div>
				<div id="gameshow_bottom_right">
					<div id="question_container">
						<div id="actual_question" class="actual_question_class"></div>
						<div id="possible_solutions">
							<div id="solution_0_container" class="question_holder">
								<div id="solution_0_left" class="solution_left">A</div>
								<div id="solution_0_right" class="solution_right"></div>
							</div>
							<div id="solution_1_container" class="question_holder">
								<div id="solution_1_left" class="solution_left">B</div>
								<div id="solution_1_right" class="solution_right"></div>
							</div>
							<div id="solution_2_container" class="question_holder">
								<div id="solution_2_left" class="solution_left">C</div>
								<div id="solution_2_right" class="solution_right"></div>
							</div>
							<div id="solution_3_container" class="question_holder">
								<div id="solution_3_left" class="solution_left">D</div>
								<div id="solution_3_right" class="solution_right"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		</div>
		<div id="user_container">
			<div id="admin_container">
				<div id="correct_answer_container">
					<div id="correct_answer_title">CORRECT ANSWER</div>
					<div id="correct_answer">-</div>
				</div>
				<div id="kick_user_container">
					<div id="kick_user" class="admin_buttons">KICK PLAYER</div>
				</div>
				<div id="next_user_container">
					<div id="next_user" class="admin_buttons">NEXT PLAYER</div>
				</div>
				<div id="moderate_questions_container">
					<div id="moderate_questions" class="admin_buttons">MODERATE QUESTIONS</div>
					<div id="game_view" class="admin_buttons">GAME<br/>VIEW</div>
				</div>
				<div id="reveal_answer_container">
					<div id="reveal_answer" class="admin_buttons">REVEAL ANSWER</div>
				</div>
				<div id="next_question_container">
					<div id="next_question" class="admin_buttons">NEXT QUESTION</div>
				</div>
			</div>
			<div id="input_question_container">
				<div id="question_title">
					<span id="question_title_top">SUBMIT</span><br/>
					<span id="question_title_bottom">TRIVIA QUESTION</span>
				</div>
				<form id="question_form">
					<div id="form_question_left">
						<div id="form_question_container">
							<label id="form_question_label" class="label_input_questions" for="form_question_input">Q:</label>
							<input type="text" id="form_question_input" class="form_input_fields" />
						</div>
						<div id="form_answer_container">
							<label id="form_answer_label" class="label_input_questions" for="form_answer_input">A:</label>
							<input type="text" id="form_answer_input" class="form_input_fields" />
						</div>
					</div>
					<div id="form_false_container">
						<label id="form_false_label" class="label_input_questions" for="form_false_input_1">FALSE:</label>
						<div id="form_false_input_container">
							<input type="text" id="form_false_input_1" class="form_input_fields_false" />
							<input type="text" id="form_false_input_2" class="form_input_fields_false" />
							<input type="text" id="form_false_input_3" class="form_input_fields_false" />
						</div>
					</div>
				</form>
				<div id="input_submit_button" class="admin_buttons">
					SUBMIT QUESTION
				</div>
				<div id="thanks_crowd_input">THANKS FOR YOUR TRIVIA QUESTION<br/><span id="thanks_more">STICK AROUND, IT MIGHT BE FEATURED NEXT ROUND!</span></div>
			</div>
		</div>
	</div>
</body>
</html>