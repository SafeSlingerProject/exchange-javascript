SafeSlingerUI.prototype.showServerSecretView = function() {
	var self = this;
	// --- creating server div and input box---//
	var serverDiv = document.createElement("div");
	serverDiv.id = "server-div";
	var serverInput = document.createElement("input");
	serverInput.type = "text";
	serverInput.id = "server-input";
	serverInput.innerHTML = "https://01060000t-dot-slinger-dev.appspot.com";
	serverInput.value = "https://01060000t-dot-slinger-dev.appspot.com";
	serverDiv.insertAdjacentHTML("afterbegin", "Server:");
	serverDiv.appendChild(serverInput);
	self.container.appendChild(serverDiv);

	//--- creating secret div and input box---//
	var secretDiv = document.createElement("div");
	secretDiv.id = "secret-div";
	var secretInput = document.createElement("input");
	secretInput.type = "text";
	secretInput.id = "secret-input";
	secretInput.value = "js-demo";
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
			url = "https://01060000t-dot-slinger-dev.appspot.com";
		}
		if(!SafeSlingerUI.util.validateLink(url)){
			return false;
		}
		self.secret = document.getElementById("secret-input").value;
		if(self.secret == null || self.secret == ""){
			return false;
		}
		self.address = url;
		self.showGetNumView();
	}, false);
	self.container.appendChild(button);
};