SafeSlingerUI.prototype.showServerSecretView = function() {
	var self = this;
	// --- creating server div and input box---//
	var serverDiv = document.createElement("div");
	serverDiv.id = "server-div";
	var serverInput = document.createElement("input");
	serverInput.type = "text";
	serverInput.id = "server-input";
	serverInput.innerHTML = "https://slinger-dev.appspot.com"
	serverInput.value = "https://slinger-dev.appspot.com";
	serverDiv.insertAdjacentHTML("afterbegin", "Server:");
	serverDiv.appendChild(serverInput);
	self.container.appendChild(serverDiv);

	//--- creating secret div and input box---//
	var secretDiv = document.createElement("div");
	secretDiv.id = "secret-div";
	var secretInput = document.createElement("input");
	secretInput.type = "text";
	secretInput.id = "secret-input";
	secretDiv.insertAdjacentHTML("afterbegin", "Secret:");
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
		if(!SafeSlingerUI.util.validateLink(url)){
			return false;
		}
		self.secret = document.getElementById("secret-input").value;
		if(self.secret == null || self.secret == ""){
			return false;
		}
		var con = new SafeSlinger.HTTPSConnection(url, self.secret);
		self.connection = con;
		self.connection.doPost("/assignUser", "data", function (){
			// -- Adding just to test UI. Otherwise this condition should show error.
			if(self.connection.response = "Request was formatted incorrectly."){
				self.showGetNumView();
			}
		});
	}, false);
	self.container.appendChild(button);
};