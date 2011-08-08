/*
 * Project: TriviaTok
 * Description: Video-based trivia game showcasing the OpenTok API and crowd-source questions
 * 
 * Author: Ezra Velazquez
 * Website: http://ezraezraezra.com
 * Date: August 2011
 */
function loadTwilio(token) {
	var call_button_counter = 1;
	var CALL_DURATION = 45;
	var t;
	
	Twilio.Device.setup(token);
 
      Twilio.Device.ready(function (device) {
        $("#log").text("Ready");
		
		$("#call").click(function() {
			if(call_button_counter % 2 == 1) {
				call();
			}
			else {
				hangup();
			}
		});
		
      });
 
      Twilio.Device.error(function (error) {
        $("#log").text("Error: " + error.message);
      });
 
      Twilio.Device.connect(function (conn) {
        $("#log").text("Successfully established call");
		call_button_counter += 1;
		$("#call").html("Hangup");
		startTwilioTimer(CALL_DURATION);
      });
 
      Twilio.Device.disconnect(function (conn) {
        $("#log").text("Call ended");
		call_button_counter += 1;
		$("#call").html("Call");
			$("#twilio_container").fadeOut('slow');//css("display", "block");
      });
 
      Twilio.Device.incoming(function (conn) {
        $("#log").text("Incoming connection from " + conn.parameters.From);
        // accept the incoming connection and start two-way audio
        conn.accept();
      });
}

function call() {
		
		$("#call").html("Hangup");
        params =  { "PhoneNumber" : $("#number").val() };
        Twilio.Device.connect(params);
      }
 
      function hangup() {
	  	
		$("#call").html("Call");
        Twilio.Device.disconnectAll();
		clearTimeout(t);
		$("#twilio_container").fadeOut('slow');
      }
	  
	  function startTwilioTimer(currTime) {
	  	if (currTime != 0) {
			$("#twilio_timer").html("Time Left: " + currTime + " secs");
			currTime -= 1;
			t = setTimeout(function(){
				startTwilioTimer(currTime);
			}, 1000);
		}
		else {
			clearTimeout(t);
			hangup();
			$("#twilio_container").fadeOut('slow');
		}
	  }
