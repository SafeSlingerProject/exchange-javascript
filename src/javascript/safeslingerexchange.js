SafeSlinger.SafeSlingerExchange = function (address){
	var self = this;
	// networking object
	self.version = 1 << 24 | 8 << 16;
	self.address = address;
	self.httpclient = null;
	//predefined data structures
	self.matchNonce = null;
	self.wrongNonce = null;
	self.matchExtrahash = null;
	self.matchHash = null;
	self.encryptedData = null;
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

SafeSlinger.SafeSlingerExchange.prototype.beginExchange = function (data) {
	var self = this;
	self.matchNonce = new Uint32Array(8);
	self.joinedMatchNonce = "";
	//console.log(self.matchNonce.join());
	window.crypto.getRandomValues(self.matchNonce);
	for(var i=0; i<8; i++){
		//console.log(self.matchNonce[i]);
		self.joinedMatchNonce += self.matchNonce[i].toString();
	}
	console.log("Match Nonce: " + self.joinedMatchNonce);
	self.wrongNonce = new Uint32Array(8);
	self.joinedWrongNonce = "";
	window.crypto.getRandomValues(self.wrongNonce);
	for(var i=0; i<8; i++){
		//console.log(self.matchNonce[i]);
		self.joinedWrongNonce += self.wrongNonce[i].toString();
	}
	console.log("Wrong Nonce: " + self.joinedWrongNonce);
	self.matchExtrahash = CryptoJS.SHA3(self.joinedMatchNonce, {outputLength: 256});
	self.wrongHash = CryptoJS.SHA3(self.joinedWrongNonce, {outputLength: 256});
	self.matchHash = CryptoJS.SHA3(self.matchExtrahash, {outputLength: 256});
	console.log("Match Hash: " + self.matchHash.toString());
	console.log("Wrong Hash: " + self.wrongHash.toString());

	self.encryptedData = CryptoJS.AES.encrypt(data, self.joinedMatchNonce);
	console.log("Encrypted Data: " + self.encryptedData.toString());

	self.protocolCommitment = CryptoJS.SHA3(self.matchHash + self.wrongHash, {outputLength: 256});
	console.log("Protocol Commitment: " + self.protocolCommitment);

	var dh = new SafeSlinger.DiffieHellman();
	dh.showParams();

	self.dataCommitment = CryptoJS.SHA3(self.protocolCommitment
		+ dh.publicKey + self.encryptedData, {outputLength: 256});
	console.log("Data Commitment: " + self.dataCommitment);

	self.httpclient = new SafeSlinger.HTTPSConnection(self.address);
};

SafeSlinger.SafeSlingerExchange.prototype.assignUser = function() {
	var self = this;
	datagram = self.httpclient.assignUser(SafeSlinger.util.parseHexString(self.dataCommitment.toString()));
};