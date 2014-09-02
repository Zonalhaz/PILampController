
function HTTPGET(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return req.responseText;
}

var getStatus = function() {
    console.log("about to fetch");
    var response = HTTPGET("http://86.173.134.240:8888/api/get?pin=18");
	
	console.log("fetched");
    //Convert to JSON
    var json = JSON.parse(response);
 
	console.log(json);
    //Extract the data
    var pin = json.pin;
    var state = json.value;
 
    //Console output to check all is working.
	console.log("pin: " + pin + "state: " + state);
 
    //Construct a key-value dictionary
    var dict = {"KEY_PIN" : pin, "KEY_STATE": state};
 
    //Send data to watch for display
    Pebble.sendAppMessage(dict);
};

//used to set the pin
var setStatus = function() {
	console.log("Setstatus");
	
	var response = HTTPGET("http://86.173.134.240:8888/api/set?pin=18&value=true");
	
	console.log("fetched");
    //Convert to JSON
    var json = JSON.parse(response);
 
	console.log(json);
    //Extract the data
    var pin = json.pin;
    var state = json.value;
 
    //Console output to check all is working.
	console.log("pin: " + pin + "state: " + state);
 
    //Construct a key-value dictionary
    var dict = {"KEY_PIN" : pin, "KEY_STATE": state};
 
    //Send data to watch for display
    Pebble.sendAppMessage(dict);
	
};

Pebble.addEventListener("ready",
  function(e) {
	console.log("javascript ready");
    //App is ready to receive JS messages
	getStatus();
  }
);

Pebble.addEventListener("appmessage",
  function(e) {
	console.log("appmessage recieved");
    //Watch wants new data!
    console.log("Received message: " + e.payload.KEY_ISGET);
	if(e.payload.KEY_ISGET === 1)
		getStatus();
	else
		setStatus();
  }
);