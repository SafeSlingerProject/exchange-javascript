SafeSlinger.SafeSlingerExchange = function (){
	var self = this;
	// networking object
	self.version = 1 << 24 | 7 << 16;
	self.address = null;
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
	self.matchNonce = new Uint32Array(1);
	window.crypto.getRandomValues(self.matchNonce);
	self.wrongNonce = new Uint32Array(1);
	window.crypto.getRandomValues(self.wrongNonce);

	self.matchExtrahash = CryptoJS.SHA3(self.matchNonce[0].toString(), {outputLength: 256});
	self.wrongHash = CryptoJS.SHA3(self.wrongNonce[0].toString(), {outputLength: 256});
	self.matchHash = CryptoJS.SHA3(self.matchExtrahash, {outputLength: 256});
	console.log(self.matchHash.toString());
	console.log(self.wrongHash.toString());

	self.encryptedData = CryptoJS.AES.encrypt(data, self.matchNonce[0].toString());
	console.log(self.encryptedData.toString());

	var dh = new SafeSlinger.DiffieHellman();
	dh.showParams();
};