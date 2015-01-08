/*! 
SafeSlinger 0.1.0
*/
var SafeSlinger = (function (){
	var SafeSlinger = {};
SafeSlinger.HTTPSConnection = function (url, secret){
	this.url = url;
	this.secret = secret;
};

SafeSlinger.HTTPSConnection.prototype.doPost = function(name, packetdata) {
	var self = this;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", self.url + name, false);
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.onload = function (e){
		var response = xhr.response;
		console.log(xhr);
		if(xhr.status === 200){
			console.log(response + xhr.status);
		}else{
			console.log("Network error: return code" + xhr.status + ", reason = " + xhr.statusText);
		}
	};
	xhr.send(self.secret);
};

SafeSlinger.SafeSlingerExchange = function (address){
	var self = this;
	// networking object
	self.version = 1 << 24 | 7 << 16;
	self.address = address;
	self.httpclient = null;
	//predefined data structures
	self.matchNonce = null;
	self.wrongNonce = null;
	self.matchExtrahash = null;
	self.matchHash = null;
	self.encryptedHata = null;
	self.protocolCommitment = null;
	self.dhkey = null;
	self.dhpubkey = null;
	self.dataCommitment = null;
	self.numUsers = 0;
	self.userID = null;
	self.correctIndex = -1;
	self.selectedIndex = -1;
	self.dhkeyLen = -1;
	self.groupkey = null;
	
	self.uidSet = [];
	self.dataCommitmentSet = {};
	self.protoCommitmentSet = {};
	self.dhpubkeySet = {};
	self.receivedcipherSet = {};
	self.matchExtraHashSet = {};
	self.wrongHashSet = {};
	self.matchHashSet = {};
	self.keyNodes = {};
	self.matchNonceSet = {};
};
	return SafeSlinger;
})();