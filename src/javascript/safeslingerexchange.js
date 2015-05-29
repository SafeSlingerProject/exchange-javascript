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

	self.dh = new SafeSlinger.DiffieHellman();
	self.dh.showParams();
	self.dhpubkey = self.dh.publicKey;
	self.dhkeyLen = self.dhpubkey.length;

	self.dataCommitment = CryptoJS.SHA3(self.protocolCommitment
		+ self.dhpubkey + self.encryptedData, {outputLength: 256});
	console.log("Data Commitment: " + self.dataCommitment);

	self.httpclient = new SafeSlinger.HTTPSConnection(self.address);
};

SafeSlinger.SafeSlingerExchange.prototype.assignUserRequest = function(callback) {
	var self = this;
	self.httpclient.assignUser(self, SafeSlinger.util.parseHexString(self.dataCommitment.toString()), callback);
};

SafeSlinger.SafeSlingerExchange.prototype.assignUser = function (response) {
	var self = this;

	self.userID = response.usrid;
	self.dataCommitmentSet[self.userID] = self.dataCommitment;
	self.protoCommitmentSet[self.userID] = self.protocolCommitment;
	self.dhpubkeySet[self.userID] = self.dhpubkey;
	self.receivedcipherSet[self.userID] = self.encryptedData;
	console.log("Assigned Id: " + self.userID);
	console.log(self.dataCommitmentSet[self.userID].toString());
	console.log(self.protoCommitmentSet[self.userID].toString());
	console.log(bigInt2str(self.dhpubkeySet[self.userID], 10));
	console.log(self.receivedcipherSet[self.userID].toString());
	return self.userID;
}

SafeSlinger.SafeSlingerExchange.prototype.selectLowestNumberRequest = function (lowNum, callback){
	var self = this;
	self.lowNum = lowNum;
	self.numUsers_Recv = 1;
	self.uidSet.push(self.userID);
	console.log(self.uidSet);
	self.httpclient.sendMinID(self.userID, lowNum, self.uidSet, 
		SafeSlinger.util.parseHexString(self.dataCommitment.toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.selectLowestNumber = function (response){
	var self = this;
	// var minVersion = SafeSlinger.jspack.Unpack('!i', response, 4)[0];
	// console.log(minVersion);
	// var count = SafeSlinger.jspack.Unpack('!i', response, 8)[0];
	// console.log("count " + count);
	// var delta_count = SafeSlinger.jspack.Unpack('!i', response, 12)[0];
	// console.log("deltacount " + delta_count);
	console.log("selectlowNum");
	console.log(response);

	var server = response.ver_server;
	var low_client = response.ver_low_client;
	var total = response.com_total;
	var deltas = response.com_deltas;
	console.log(deltas);
	var delta_count = deltas.length;



	if(self.numUsers_Recv < self.numUsers){
		if(delta_count > 0){
			self.offset = 16;
			for(var i = 0 ;i < delta_count; i++){
				var uid = deltas[i].usrid;
				self.uidSet.push(uid);
				var commitment = deltas[i].commit_b64;
				self.dataCommitmentSet[uid] = commitment;
				self.numUsers_Recv += 1;
				console.log("Received " + self.numUsers_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numUsers_Recv < self.numUsers){
		self.httpclient.sendMinID(self.userID, self.lowNum, self.uidSet, 
			SafeSlinger.util.parseHexString(self.dataCommitment.toString()), function (response){
				self.selectLowestNumber(response);
			});
	}else{
		console.log("All data is recieved");
		console.log(self.dataCommitmentSet);
		self.syncDataRequest(function (response){
			self.syncData(response);
		});
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncDataRequest = function (callback){
	var self = this;
	self.numUsers_Recv = 1;
	self.uidSet = [];
	self.uidSet.push(self.userID);
	var protoCommit = SafeSlinger.util.parseHexString(self.protocolCommitment.toString());
	var dhpubkey = SafeSlinger.util.parseHexString(bigInt2str(self.dhpubkey, 16));
	var encryptedData = SafeSlinger.util.parseHexString(self.encryptedData.ciphertext.toString());


	self.httpclient.syncData(self.userID, protoCommit, 
		dhpubkey, self.uidSet, encryptedData, callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncData = function (response) {
	var self = this;
	console.log("********************** Safeslinger syncData ************");
	console.log(response);

	var server = response.ver_server;
	var data_total = response.data_total;
	var data_deltas = response.data_deltas;
	var delta_counts = data_deltas.length;

	console.log("data_total --> " + data_total);
	console.log("data_deltas --> " + data_deltas);
	console.log("data_counts --> " + delta_counts);

	 if(self.numUsers_Recv < self.numUsers){
	 	if(delta_counts > 0){
	 		for(var i = 0; i < delta_counts; i++){
	 			var usrid = data_deltas[i].usrid;
	 			var data = data_deltas[i].data_b64;
	 			console.log("User id -->" + usrid);
	 			console.log("data --> " + data);

	 			// TODO: extract and add data to respective arrays.
	 			self.uidSet.push(usrid);
	 			self.numUsers_Recv += 1;
	 			console.log("Received " + self.numUsers_Recv + "/" + self.numUsers + " Commitments");

	 		}
	 	}
	 }

	 if(self.numUsers_Recv < self.numUsers){
	 	var protoCommit = SafeSlinger.util.parseHexString(self.protocolCommitment.toString());
		var dhpubkey = SafeSlinger.util.parseHexString(bigInt2str(self.dhpubkey, 16));
		var encryptedData = SafeSlinger.util.parseHexString(self.encryptedData.ciphertext.toString());

	 	self.httpclient.syncData(self.userID, protoCommit, 
	 		dhpubkey, self.uidSet, encryptedData, function (response){
			self.syncData(response);
		});
	 }else{
	 	console.log("response from sync data");
	 	console.log(response);
	 	// TODO: call Compute3Wordphrases
	 }
	
}