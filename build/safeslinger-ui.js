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
SafeSlingerUI.prototype.showGetNumView = function() {
	var self = this;
	self.container.innerHTML = "";
	var numberDiv = document.createElement("div");
	numberDiv.id = "number-div";
	numberDiv.insertAdjacentHTML("afterbegin", "Select Number of users: ");
	var select = document.createElement("select");
	select.id = "num-users";
	var maxUsers = 10;
	for(var i=0; i<maxUsers; i++){
		var option = document.createElement("option");
		option.value = i;
		option.innerHTML = i;
		select.appendChild(option);
	}
	numberDiv.appendChild(select);

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.id = 'submit-users';
	submit.addEventListener("click", function (){
		console.log(document.getElementById("num-users").value);
		var ssExchange = new SafeSlinger.SafeSlingerExchange();
		self.ssExchange = ssExchange;
		self.ssExchange.beginExchange(self.secret);
		self.enterLowestNumber();
	});
	self.container.appendChild(numberDiv);
	self.container.appendChild(submit);
};
SafeSlingerUI.prototype.enterLowestNumber = function() {
	var self = this;
	self.container.innerHTML = "";
	var lowestNumDiv = document.createElement("div");
	lowestNumDiv.id = "lowest-num";

	lowestNumDiv.insertAdjacentHTML("afterbegin", "Enter the lowest number: ");

	var lowestNumInput = document.createElement("input");
	lowestNumInput.type = "text";
	lowestNumInput.id = "lowest-num-input";
	lowestNumDiv.appendChild(lowestNumInput);

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.id = 'submit-lowest-num';
	submit.addEventListener("click", function (){
		console.log(document.getElementById("lowest-num-input").value);
		self.showPhrases();
	});

	self.container.appendChild(lowestNumDiv);
	self.container.appendChild(submit);
};
SafeSlingerUI.prototype.showPhrases = function() {
	var self = this;
	self.container.innerHTML = "";
	var phraseDiv = document.createElement("div");
	var input1 = document.createElement("input");
	input1.type = "radio";
	input1.name = "phrase";
	input1.id = "first";
	input1.value = "Cat Dog Mad";
	var label1 = document.createElement("label");
	label1.for = "first";
	label1.innerHTML = "Cat Dog Mad";


	var input2 = document.createElement("input");
	input2.type = "radio";
	input2.name = "phrase";
	input2.id = "second";
	input2.value = "Go Goa Gone";
	var label2 = document.createElement("label");
	label2.for = "second";
	label2.innerHTML = "Go Goa Gone";

	var input3 = document.createElement("input");
	input3.type = "radio";
	input3.name = "phrase";
	input3.id = "third";
	input3.value = "Hi Hello Bye";
	var label3 = document.createElement("label");
	label3.for = "third";
	label3.innerHTML = "Hi Hello Bye";

	var noMatch = document.createElement("input");
	noMatch.type = "submit";
	noMatch.id = "no-match";
	noMatch.value = "No Match";

	var next = document.createElement("input");
	next.type = "submit";
	next.id = "next";
	next.value = "Next";

	var br = document.createElement("br");
	phraseDiv.appendChild(input1);
	phraseDiv.appendChild(label1);
	phraseDiv.appendChild(input2);
	phraseDiv.appendChild(label2);
	phraseDiv.appendChild(input3);
	phraseDiv.appendChild(label3);
	phraseDiv.appendChild(br);
	phraseDiv.appendChild(noMatch);
	phraseDiv.appendChild(next);

	self.container.appendChild(phraseDiv);
};
SafeSlingerUI.util = {};

SafeSlingerUI.util.validateLink = function (link) {
	/*
	** Regex Source: https://gist.github.com/dperini/729294
	*/
	var re_weburl = new RegExp(
	  "^" +
	    // protocol identifier
	    "(?:(?:https?|ftp)://)" +
	    // user:pass authentication
	    "(?:\\S+(?::\\S*)?@)?" +
	    "(?:" +
	      // IP address exclusion
	      // private & local networks
	      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
	      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
	      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
	      // IP address dotted notation octets
	      // excludes loopback network 0.0.0.0
	      // excludes reserved space >= 224.0.0.0
	      // excludes network & broacast addresses
	      // (first & last IP address of each class)
	      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
	      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
	      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
	    "|" +
	      // host name
	      "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
	      // domain name
	      "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
	      // TLD identifier
	      "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
	    ")" +
	    // port number
	    "(?::\\d{2,5})?" +
	    // resource path
	    "(?:/\\S*)?" +
	  "$", "i"
	);
	return re_weburl.test(link);
};

SafeSlingerUI.util.isNum = function (number){
	return !isNaN(number);
}
	return SafeSlingerUI;
})();