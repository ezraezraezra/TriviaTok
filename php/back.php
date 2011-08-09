<?php
header('Content-type: application/json; charset=utf-8');
require "info.php";
/*
 * Project: TriviaTok
 * Description: Video-based trivia game showcasing the OpenTok API and crowdsourced questions
 * Website:     http://triviatok.opentok.com
 * 
 * Author: Ezra Velazquez
 * Website: http://ezraezraezra.com
 * Date: August 2011
 * 
 */
$comm = $_GET['comm'];

switch($comm) {
	case 'input_question':
		$trivia_entered = $_GET['trivia_entered'];
		$trivia_question = $_GET['trivia_question'];
		$trivia_answer = $_GET['trivia_answer'];
		$trivia_false_1 = $_GET['trivia_false_1'];
		$trivia_false_2 = $_GET['trivia_false_2'];
		$trivia_false_3 = $_GET['trivia_false_3'];
		submitQuestion($hostname, $user, $pwd, $database, $trivia_question, $trivia_answer, $trivia_false_1, $trivia_false_2, $trivia_false_3);
		break;
	case 'live_questions':
		$user_type = $_GET['user_type'];
		$amount_type = $_GET['amount_type'];

		switch($user_type)
		{
			case 'host':
				host_obligations($hostname, $user, $pwd, $database, $amount_type);
				break;
			case 'participant':
				break;
		}
		break;
	case 'dirty_question':
		getDirtyQuestions($hostname, $user, $pwd, $database);
		break;
	case 'update_question':
		$q_id = $_GET['q_id'];
		$clean_status = $_GET['clean_status'];
		updateQuestion($hostname, $user, $pwd, $database, $q_id, $clean_status);
		break;
	default:
		echo '400 - Need proper command';
}

/*
 * MAIN FUNCTIONS
 */

/*
 * Update the status of crowdsourced trivia questions
 */
function updateQuestion($hostname, $user, $pwd, $database, $q_id, $clean_status) {
	$connection = mysql_connect($hostname, $user, $pwd);
	if(!$connection) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	$db_selected = mysql_select_db($database, $connection);
	if(!$db_selected) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	
	$question_update = "UPDATE trivia SET clean='$clean_status' WHERE q_id='$q_id'";
	$question_update = submit_info($question_update, $connection, false);
	
	$arr = array("status"=>'200');

	mysql_close($connection);
	$output = json_encode($arr);
	echo $output;
}

/*
 * Return a random question that has not been clearned by the moderator
 */
function getDirtyQuestions($hostname, $user, $pwd, $database) {
	$connection = mysql_connect($hostname, $user, $pwd);
	if(!$connection) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	$db_selected = mysql_select_db($database, $connection);
	if(!$db_selected) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	
	$question_request = "SELECT * FROM trivia WHERE clean='2' ORDER BY RAND() LIMIT 1";
	$question_request = submit_info($question_request, $connection, true);
	while(($rows[] = mysql_fetch_assoc($question_request)) || array_pop($rows));
	$counter = 0;
	foreach ($rows as $row):
		$dirty_question = new Question("{$row['q_id']}","{$row['question']}", "{$row['solution']}", "{$row['false_one']}", "{$row['false_two']}", "{$row['false_three']}");
		$counter += 1;
	endforeach;
	
	if($counter >= 1) {
		$status = '200';
	}
	else {
		$status = '400';
	}
	
	$arr = array("question"=>$dirty_question, "status"=>$status);
	mysql_close($connection);
	$output = json_encode($arr);
	echo $output;
}

/*
 * Submit a question to the database
 */
function submitQuestion($hostname, $user, $pwd, $database, $trivia_question, $trivia_answer, $trivia_false_1, $trivia_false_2, $trivia_false_3) {
	$connection = mysql_connect($hostname, $user, $pwd);
	if(!$connection) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	$db_selected = mysql_select_db($database, $connection);
	if(!$db_selected) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	
	$trivia_input = "INSERT INTO trivia (question, solution, false_one, false_two, false_three, clean) VALUES('$trivia_question','$trivia_answer','$trivia_false_1','$trivia_false_2','$trivia_false_3','2')";
	$trivia_input = submit_info($trivia_input, $connection, true);
	
	$arr = array("questions"=>'200');
	mysql_close($connection);
	$output = json_encode($arr);
	echo $output;
}

/*
 * Grab a set amount ($amount_type) of questions from the database
 */
function host_obligations($hostname, $user, $pwd, $database, $amount_type) {
	$connection = mysql_connect($hostname, $user, $pwd);
	if(!$connection) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	$db_selected = mysql_select_db($database, $connection);
	if(!$db_selected) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}

	$question_request = "SELECT * FROM trivia WHERE clean='1' ORDER BY RAND() LIMIT $amount_type";
	$question_request = submit_info($question_request, $connection, true);
	while(($rows[] = mysql_fetch_assoc($question_request)) || array_pop($rows));
	$counter = 0;
	foreach ($rows as $row):
		$question_array[$counter] = new Question("{$row['q_id']}","{$row['question']}", "{$row['solution']}", "{$row['false_one']}", "{$row['false_two']}", "{$row['false_three']}");
		$counter += 1;
	endforeach;
	
	$arr = array("questions"=>$question_array);
	mysql_close($connection);
	$output = json_encode($arr);
	echo $output;
}

/* **********************
 * HELPER FUNCTIONS
 * **********************/
function submit_info($data, $conn, $return) {
	$result = mysql_query($data,$conn);
	if(!$result) {
		die("Error ".mysql_errno()." : ".mysql_error());
	}
	else if($return == true) {
		return $result;
	}
}

/*
 * STRUCTURE FOR SENDING QUESTIONS VIA JSON
 */
class Question {
	public $question;
	public $solution;
	public $false_one;
	public $false_two;
	public $false_three;
	public $q_id;
	
	function __construct($in_q_id, $in_question, $in_solution, $in_false_one, $in_false_two, $in_false_three) {
		$this->question = $in_question;
		$this->solution = $in_solution;
		$this->false_one = $in_false_one;
		$this->false_two = $in_false_two;
		$this->false_three = $in_false_three;
		$this->q_id = $in_q_id;
	}	
}
?>