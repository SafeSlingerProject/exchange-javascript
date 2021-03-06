/*! 
SafeSlinger 0.1.0
*/
/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2010-2015 Carnegie Mellon University
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
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
SafeSlingerUI.prototype.showGetNumView = function() {
	var self = this;
	self.container.innerHTML = "";
	var numberDiv = document.createElement("div");
	numberDiv.id = "number-div";
	numberDiv.insertAdjacentHTML("afterbegin", "Select Number of users: ");
	var select = document.createElement("select");
	select.id = "num-users";
	var maxUsers = 10;
	for(var i=2; i<=maxUsers; i++){
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
		var ssExchange = new SafeSlinger.SafeSlingerExchange("https://01060000t-dot-slinger-dev.appspot.com");
		self.ssExchange = ssExchange;
		self.ssExchange.numUsers = document.getElementById("num-users").value;
		self.ssExchange.beginExchange(self.secret);
		self.ssExchange.assignUserRequest(function (response){
			console.log(response);
			var userID = self.ssExchange.assignUser(response);
			self.showGroupingNumber(userID);
		});
	});
	self.container.appendChild(numberDiv);
	self.container.appendChild(submit);
};
SafeSlingerUI.prototype.showGroupingNumber = function(userID) {
	var self = this;
	self.container.innerHTML = "";
	var lowestNumDiv = document.createElement("div");
	lowestNumDiv.id = "lowest-num";

	lowestNumDiv.insertAdjacentHTML("afterbegin", "Enter the lowest number: ");
	lowestNumDiv.insertAdjacentHTML("afterbegin", "Assigned Id: " + userID + " ");

	var lowestNumInput = document.createElement("input");
	lowestNumInput.type = "text";
	lowestNumInput.id = "lowest-num-input";
	lowestNumDiv.appendChild(lowestNumInput);

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.id = 'submit-lowest-num';
	submit.addEventListener("click", function (){
		self.lowNum = document.getElementById("lowest-num-input").value;
		console.log(self.lowNum);
		self.ssExchange.syncUsersRequest(self.lowNum, function (response) {
			console.log(response);
			var isData = self.ssExchange.syncUsers(response);
			self.progressDataRequest();
		});
	});

	self.container.appendChild(lowestNumDiv);
	self.container.appendChild(submit);
};

SafeSlingerUI.prototype.progressDataRequest = function (){
	var self = this;
	self.progressData(); 					
};

SafeSlingerUI.prototype.progressData = function (){
	var self = this;
	if(!self.ssExchange.isDataComplete()){
		setTimeout(function() { 
			self.progressData(); 					
		}, 1000);
	}else{
		var position = self.ssExchange.getPosition();	
		var hash = self.ssExchange.getHash24Bits();
		var decoy1 = self.ssExchange.getDecoy24Bits1();
		var decoy2 = self.ssExchange.getDecoy24Bits2();	
		self.showPhrases(position, hash, decoy1, decoy2);
	}
};
SafeSlingerUI.prototype.showPhrases = function(position, hash, decoy1, decoy2) {
	var self = this;
	var selected = null;
	self.container.innerHTML = "";
	var phraseDiv = document.createElement("div");
	
	console.log("position --> " + position);
	console.log("hash --> " + hash);
	console.log("decoy1 --> " + decoy1);
	console.log("decoy2 --> " + decoy2);

	var hashes = [];	
	hashes[position-1] = hash;
	switch (position-1) {
	case 0:
		hashes[1] = decoy1;
		hashes[2] = decoy2;
		break;
	case 1:
		hashes[0] = decoy1;
		hashes[2] = decoy2;
		break;
	case 2:
		hashes[0] = decoy1;
		hashes[1] = decoy2;
		break;
	}
	
	var phrase1 = SafeSlinger.util.getWordPhrase(hashes[0]) +" ("+ SafeSlinger.util.getNumberPhrase(hashes[0]) +") ";
	var phrase2 = SafeSlinger.util.getWordPhrase(hashes[1]) +" ("+ SafeSlinger.util.getNumberPhrase(hashes[1]) +") ";
	var phrase3 = SafeSlinger.util.getWordPhrase(hashes[2]) +" ("+ SafeSlinger.util.getNumberPhrase(hashes[2]) +") ";
		
	var input1 = document.createElement("input");
	input1.type = "radio";
	input1.name = "phrase";
	input1.id = "first";
	input1.value = phrase1;
	var label1 = document.createElement("label");
	label1.for = "first";
	label1.innerHTML = phrase1;

	var input2 = document.createElement("input");
	input2.type = "radio";
	input2.name = "phrase";
	input2.id = "second";
	input2.value = phrase2;
	var label2 = document.createElement("label");
	label2.for = "second";
	label2.innerHTML = phrase2;

	var input3 = document.createElement("input");
	input3.type = "radio";
	input3.name = "phrase";
	input3.id = "third";
	input3.value = phrase3;
	var label3 = document.createElement("label");
	label3.for = "third";
	label3.innerHTML = phrase3;

	var noMatch = document.createElement("input");
	noMatch.type = "submit";
	noMatch.id = "no-match";
	noMatch.value = "No Match";
	noMatch.addEventListener("click", function (){
		self.ssExchange.syncSignaturesRequest(selected, function (response) {
			console.log(response);
			var isMatch = self.ssExchange.syncSignatures(response);
			self.progressMatchRequest();
		});
	});

	var next = document.createElement("input");
	next.type = "submit";
	next.id = "next";
	next.value = "Next";
	next.addEventListener("click", function (){
		if (document.getElementById("first").checked) {
			selected = hashes[0];
		} else if (document.getElementById("second").checked) {
			selected = hashes[1];			
		} else if (document.getElementById("third").checked) {
			selected = hashes[2];			
		}
		self.ssExchange.syncSignaturesRequest(selected, function (response) {
			console.log(response);
			var isMatch = self.ssExchange.syncSignatures(response);
			self.progressMatchRequest();
		});
	});
	
	var br = document.createElement("br");
	phraseDiv.appendChild(input1);
	phraseDiv.appendChild(label1);
	phraseDiv.appendChild(br);
	phraseDiv.appendChild(input2);
	phraseDiv.appendChild(label2);
	phraseDiv.appendChild(br);
	phraseDiv.appendChild(input3);
	phraseDiv.appendChild(label3);
	phraseDiv.appendChild(br);
	phraseDiv.appendChild(noMatch);
	phraseDiv.appendChild(next);

	self.container.appendChild(phraseDiv);
};

SafeSlingerUI.prototype.progressMatchRequest = function (){
	var self = this;
	self.progressMatch(); 					
};

SafeSlingerUI.prototype.progressMatch = function (){
	var self = this;
	if(!self.ssExchange.isMatchComplete()){
		setTimeout(function() { 
			self.progressMatch(); 					
		}, 1000);
	}else{
		var dataSet = self.ssExchange.getDataSet();	
		self.showResults(dataSet);
	}
};

SafeSlingerUI.prototype.showResults = function(plaintextSet) {
	var self = this;
	self.container.innerHTML = "";
	var resultDiv = document.createElement("div");
	resultDiv.id = "plain-set";

	resultDiv.insertAdjacentHTML("afterbegin", "Result: " + JSON.stringify(plaintextSet));

	self.container.appendChild(resultDiv);
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
};

SafeSlingerUI.util.showError = function (self, msg){
	self.container.innerHTML = "";
	var resultDiv = document.createElement("div");
	resultDiv.id = "error";
	resultDiv.insertAdjacentHTML("afterbegin", "Error: " + msg);
	self.container.appendChild(resultDiv);
};
	return SafeSlingerUI;
})();