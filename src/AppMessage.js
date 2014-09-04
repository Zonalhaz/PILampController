
var g_state;
var ipAddress;

function HTTPGET(url) {
    var req = new XMLHttpRequest();
	var result;
    req.open("GET", url, false);
	
	req.onload = function (e) {
  if (req.readyState === 4) {
    if (req.status === 200) {
      console.log(req.responseText);
		result = req.responseText;

    } else {
		console.log("errorororo");
		console.log(req.statusText);
		result = null;
    }
  }
};
	req.onerror = function (e) {
		console.log("Error Connecting " + req.statusText);
		result = "error";
		console.log("result: " + result);
		//MAYBE ADD AN APPMESSAGE ABOUT ERROR
	};
	
	req.send(null);
	console.log("about to return");
    return result;
}

//Get the status of the pin from the pi
var getStatus = function() {
    console.log("about to fetch");
    var response = HTTPGET("http://"+ipAddress+"/api/get?pin=18");
	console.log("fetch complete");
	console.log("response: " + response);
	
	if (response !== null && response !== "error")
		{
		//Convert to JSON
		var json = JSON.parse(response);
 
		//Extract the data
		var pin = json.pin;
		var state = json.value;
		g_state = json.value;
 
		//Console output to check all is working.
		console.log("pin: " + pin + "state: " + state);
 
		//Construct a key-value dictionary
		var dict = {"KEY_PIN" : pin, "KEY_STATE": state};
 
		//Send data to watch for display
		Pebble.sendAppMessage(dict);
		}
};

//used to set the pin
var setStatus = function() {
	console.log("g_state is: " + g_state);
	var newState;
	
	if (g_state == "true")
		newState = "false";
	else
		newState = "true";
	//Set pin to new state	
	HTTPGET("http://86.173.134.240:8888/api/set?pin=18&value=" + newState );
	
	console.log("set to " + newState);
	//Call getStatus
	getStatus();
    
	
};
//Called when the event listener first loads
Pebble.addEventListener("ready",
  function(e) {
	console.log("javascript ready");
    //App is ready to receive JS messages
	//getStatus();
  }
);
//Called when the phone recieves a message from the phone
Pebble.addEventListener("appmessage",
  function(e) {
	console.log("appmessage recieved");
    //Watch wants new data!
    console.log("Received message: " + e.payload.KEY_ISGET);
	if(e.payload.KEY_ISGET == 1)
		getStatus();
	else
		setStatus();
  }
);

//Called when the settings menu is opened
Pebble.addEventListener("showConfiguration",
  function(e) {
	var storedIP = localStorage.getItem(0);
	console.log("stored ip: " + storedIP);
	ipAddress = storedIP;
    //Load the remote config page
    Pebble.openURL("http://zonalhaz.com/pebble/pebble_config.html#" + storedIP);
  }
);

//Called when the settings menu is closed
Pebble.addEventListener("webviewclosed",
  function(e) {
    //Get JSON dictionary
    var configuration = JSON.parse(decodeURIComponent(e.response));
	var configurationResult = configuration.Address;

    console.log("Configuration window returned: " + configurationResult);
	
	localStorage.setItem(0,configurationResult);
	
	
	//getStatus();
	
  }
);
