/*! 
SafeSlinger 0.1.0
*/
var SafeSlingerUI = (function (){
	var SafeSlingerUI = {};
SafeSlingerUI = function (container){
	this.container = container;
};
SafeSlingerUI.prototype.showServerSecretView = function() {
	var self = this;
	// --- creating server div and input box---//
	var serverDiv = document.createElement("div");
	serverDiv.id = "server-div";
	var serverInput = document.createElement("input");
	serverInput.type = "text";
	serverInput.id = "server-input";
	serverDiv.appendChild(serverInput);
	self.container.appendChild(serverDiv);

	//--- creating secret div and input box---//
	var secretDiv = document.createElement("div");
	secretDiv.id = "secret-div";
	var secretInput = document.createElement("input");
	secretInput.type = "text";
	secretInput.id = "secret-input";
	secretDiv.appendChild(secretInput);
	self.container.appendChild(secretDiv);

	//--- Submit button ----//
	var button = document.createElement("input");
	button.type = "submit";
	button.value = "Begin Exchange";
	button.id = "server-submit";
	button.addEventListener('click',function (){
		var url = document.getElementById("server-input").value;
		if(!url){
			url = "https://slinger-dev.appspot.com";
		}
		var secret = document.getElementById("secret-input").value;
		var con = new SafeSlinger.HTTPSConnection(url, secret);
		self.connection = con;
		self.connection.doPost("/assignUser");
	}, false);
	self.container.appendChild(button);
};
	return SafeSlingerUI;
})();