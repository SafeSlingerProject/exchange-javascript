SafeSlinger.SafeSlingerExchange = function (address){
	var self = this;

	// TODO: check at runtime for compatible browsers supporting CryptoJS:
	
	// networking object
	self.version = 1 << 24 | 8 << 16;
	self.address = address;
	self.httpclient = null;
	//predefined data structures
	self.data = null;
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
	self.hash = null;
	self.decoy1 = null;
	self.decoy2 = null;
	self.sig = null;
	
	self.uidSet = [];
	self.dataCommitmentSet = {};
	self.protoCommitmentSet = {};
	self.dhpubkeySet = {};
	self.receivedcipherSet = {};
	self.signatureSet = {};
	self.keyNodes = {};
	self.encMatchNonceSet = {};
	self.matchNonceSet = {};
	self.dataSet = {};
};

SafeSlinger.SafeSlingerExchange.prototype.beginExchange = function (data) {
	var self = this;
	self.data = data;
	console.log("Data: " + self.data);
	
	// TODO: Determine if CryptoJS.lib.WordArray.random() or window.crypto.getRandomValues() is better
	
	self.matchNonce = CryptoJS.lib.WordArray.random(256/8);	
	console.log("Match Nonce: " + self.matchNonce);
	self.wrongNonce = CryptoJS.lib.WordArray.random(256/8);	
	console.log("Wrong Nonce: " + self.wrongNonce);
	self.matchExtrahash = CryptoJS.SHA3(self.matchNonce, {outputLength: 256});
	self.wrongHash = CryptoJS.SHA3(self.wrongNonce, {outputLength: 256});
	self.matchHash = CryptoJS.SHA3(self.matchExtrahash, {outputLength: 256});
	console.log("Match Extra Hash: " + self.matchExtrahash);
	console.log("Match Hash: " + self.matchHash);
	console.log("Wrong Hash: " + self.wrongHash);

	self.encryptedData = CryptoJS.AES.encrypt(
			data, 
			getAesKeyWords(self.matchNonce), 
			{ iv: getAesIvWords(self.matchNonce), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7  }
		).ciphertext;
	console.log("Encrypted Data: " + self.encryptedData);

	var protWords = CryptoJS.enc.Hex.parse(self.matchHash.toString() + self.wrongHash.toString());
	console.log("Prot: " + protWords);
	self.protocolCommitment = CryptoJS.SHA3(protWords, {outputLength: 256});
	console.log("Protocol Commitment: " + self.protocolCommitment);

	self.dh = new SafeSlinger.DiffieHellman();
	self.dh.genKeys();
	self.dhpubkey = CryptoJS.enc.Hex.parse(bigInt2str(self.dh.publicKey, 16));
	self.dhkey = CryptoJS.enc.Hex.parse(bigInt2str(self.dh.privateKey, 16));
	self.dhkeyLen = self.dhkey.length;
	console.log("DH Public: " + self.dhpubkey);
	console.log("DH Private: " + self.dhkey);
	
	var dataWords = CryptoJS.enc.Hex.parse(self.protocolCommitment.toString() + self.dhpubkey.toString() + self.encryptedData.toString());
	console.log("Data: " + dataWords);
	self.dataCommitment = CryptoJS.SHA3(dataWords, {outputLength: 256});
	console.log("Data Commitment: " + self.dataCommitment);

	self.httpclient = new SafeSlinger.HTTPSConnection(self.address);
};

SafeSlinger.SafeSlingerExchange.prototype.assignUserRequest = function(callback) {
	var self = this;
	
	self.httpclient.assignUser(SafeSlinger.util.parseHexString(self.dataCommitment.toString()), callback);
};

SafeSlinger.SafeSlingerExchange.prototype.assignUser = function (response) {
	var self = this;
	console.log("********************** SafeSlinger assignUser ************");
	console.log(response);

	self.userID = response.usrid;
	self.dataSet[self.userID] = self.data;
	self.dataCommitmentSet[self.userID] = self.dataCommitment;
	self.protoCommitmentSet[self.userID] = self.protocolCommitment;
	self.dhpubkeySet[self.userID] = self.dhpubkey;
	self.receivedcipherSet[self.userID] = self.encryptedData;
	console.log("Assigned Id: " + self.userID);
	console.log(self.dataSet[self.userID].toString());
	console.log(self.dataCommitmentSet[self.userID].toString());
	console.log(self.protoCommitmentSet[self.userID].toString());
	console.log(self.dhpubkeySet[self.userID].toString());
	console.log(self.receivedcipherSet[self.userID].toString());
	return self.userID;
}

SafeSlinger.SafeSlingerExchange.prototype.syncUsersRequest = function (lowNum, callback){
	var self = this;
	self.attempt = 1;
	self.lowNum = lowNum;
	self.numUsers_Recv = 1;
	self.uidSet.push(self.userID);
	console.log(self.uidSet);
	
	self.httpclient.syncUsers(self.userID, lowNum, self.uidSet, 
		SafeSlinger.util.parseHexString(self.dataCommitment.toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncUsers = function (response){
	var self = this;
	console.log("********************** SafeSlinger syncUsers ************");
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
				var commitment = CryptoJS.enc.Latin1.parse(atob(deltas[i].commit_b64));
				self.dataCommitmentSet[uid] = commitment;

			 	// TODO: verify all commits are appropriately sized
			 	
				console.log(uid +"'s dataCommitment: " + self.dataCommitmentSet[uid]);

				self.numUsers_Recv++;
				console.log("Received " + self.numUsers_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numUsers_Recv < self.numUsers){
		setTimeout(function() {
			self.attempt++;
			self.httpclient.syncUsers(self.userID, self.lowNum, self.uidSet, 
				SafeSlinger.util.parseHexString(self.dataCommitment.toString()), function (response){
					self.syncUsers(response);
				});
		}, fibonacci(self.attempt) * 1000);
	}else{
		console.log("All commitments received");
		console.log(self.dataCommitmentSet);
		
		self.syncDataRequest(function (response){
			self.syncData(response);
		});
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncDataRequest = function (callback){
	var self = this;
	self.numData_Recv = 1;
	self.uidSet = [];
	self.uidSet.push(self.userID);
	var protoCommit = SafeSlinger.util.parseHexString(self.protocolCommitment.toString());
	var dhpubkey = SafeSlinger.util.parseHexString(self.dhpubkey.toString());
	var encryptedData = SafeSlinger.util.parseHexString(self.encryptedData.toString());

	self.httpclient.syncData(self.userID, protoCommit, 
		dhpubkey, self.uidSet, encryptedData, callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncData = function (response) {
	var self = this;
	console.log("********************** SafeSlinger syncData ************");
	console.log(response);

	var server = response.ver_server;
	var data_total = response.data_total;
	var data_deltas = response.data_deltas;
	var delta_counts = data_deltas.length;

	console.log("data_total --> " + data_total);
	console.log("data_deltas --> " + data_deltas);
	console.log("data_counts --> " + delta_counts);

	 if(self.numData_Recv < self.numUsers){
	 	if(delta_counts > 0){
	 		for(var i = 0; i < delta_counts; i++){
				var uid = data_deltas[i].usrid;
	 			self.uidSet.push(uid);
				
	 			var data = atob(data_deltas[i].data_b64);
				self.protoCommitmentSet[uid] = CryptoJS.enc.Latin1.parse(data.substring(0, 32));
				self.dhpubkeySet[uid] = CryptoJS.enc.Latin1.parse(data.substring(32, 32 + 192));
				self.receivedcipherSet[uid] = CryptoJS.enc.Latin1.parse(data.substring(32 + 192));
				console.log(uid +"'s data: " + CryptoJS.enc.Latin1.parse(data));
				console.log(uid +"'s protoCommitment: " + self.protoCommitmentSet[uid]);
				console.log(uid +"'s dhpubkey: " + self.dhpubkeySet[uid]);
				console.log(uid +"'s receivedcipher: " + self.receivedcipherSet[uid]);

			 	// TODO: verify all data received hashes to each previous commitment received				

				console.log(uid +"'s data commit: " + self.dataCommitmentSet[uid]);
				console.log(uid +"'s data hash: " + CryptoJS.SHA3(CryptoJS.enc.Latin1.parse(data), {outputLength: 256}));

	 			self.numData_Recv++;
	 			console.log("Received " + self.numData_Recv + "/" + self.numUsers + " Items");
	 		}
	 	}
	 }

	 if(self.numData_Recv < self.numUsers){
	 	var protoCommit = SafeSlinger.util.parseHexString(self.protocolCommitment.toString());
		var dhpubkey = SafeSlinger.util.parseHexString(self.dhpubkey.toString());
		var encryptedData = SafeSlinger.util.parseHexString(self.encryptedData.toString());
		
		setTimeout(function() { 			
			self.attempt++;
		 	self.httpclient.syncData(self.userID, protoCommit, 
		 		dhpubkey, self.uidSet, encryptedData, function (response){
				self.syncData(response);
			});
		}, fibonacci(self.attempt) * 1000);
	 }else{
		console.log("All data received");
		console.log(self.protoCommitmentSet);
		console.log(self.dhpubkeySet);
		console.log(self.receivedcipherSet);
	 	
		var hash = "";
		self.uidSet.sort();
 		for(var i = 0; i < self.uidSet.length; i++){
			var uid = self.uidSet[i];
			hash += self.protoCommitmentSet[uid].toString(CryptoJS.enc.Latin1);
			hash += self.dhpubkeySet[uid].toString(CryptoJS.enc.Latin1);
			hash += self.receivedcipherSet[uid].toString(CryptoJS.enc.Latin1);
 		}
		self.hash = CryptoJS.SHA3(CryptoJS.enc.Latin1.parse(hash), {outputLength: 256});
		console.log("Hash: " + self.hash);

		// TODO: assign deterministic decoy values
		self.decoy1 = CryptoJS.lib.WordArray.random(24/8);	
		self.decoy2 = CryptoJS.lib.WordArray.random(24/8);	

		// TODO: crypto randomize correct selection
		self.correctSelection = Math.floor(Math.random() * 3 + 1);
				
		// ui must check state from outside for all data elements before continuing
	 }
	 console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncSignaturesRequest = function (selectedHash, callback){
	var self = this;
	self.attempt = 1;
	self.numSigs_Recv = 1;
	self.uidSet = [];
	self.uidSet.push(self.userID);
	console.log(self.uidSet);

	if (selectedHash != null && selectedHash.toString() == self.getHash24Bits().toString()) {
		// match
		var sig1 = self.matchExtrahash;
		var sig2 = self.wrongHash;
	} else {
		// wrong
		var sig1 = self.matchHash;
		var sig2 = self.wrongNonce;
	}
	var sigWords = CryptoJS.enc.Latin1.parse(sig1.toString(CryptoJS.enc.Latin1) + sig2.toString(CryptoJS.enc.Latin1));
	self.sig = sigWords;
	console.log("Signature: " + self.sig);
	self.signatureSet[self.userID] = self.sig;
	
	self.httpclient.syncSignatures(self.userID, self.uidSet, 
			SafeSlinger.util.parseHexString(self.sig.toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncSignatures = function (response){
	var self = this;
	console.log("********************** SafeSlinger syncSignatures ************");
	console.log(response);

	var server = response.ver_server;
	var total = response.sig_total;
	var deltas = response.sig_deltas;
	console.log(deltas);
	var delta_count = deltas.length;

	if(self.numSigs_Recv < self.numUsers){
		if(delta_count > 0){
			self.offset = 16;
			for(var i = 0 ;i < delta_count; i++){
				var uid = deltas[i].usrid;
				self.uidSet.push(uid);
				var sig = CryptoJS.enc.Latin1.parse(atob(deltas[i].signature_b64));
				self.signatureSet[uid] = sig;
				
				console.log(uid +"'s signature: " + self.signatureSet[uid]);

			 	// TODO: verify all data received hashes to each previous commitment received
				
				console.log(uid +"'s protoCommit: " + self.protoCommitmentSet[uid]);
				console.log(uid +"'s match sig protoCommit: " + 
						CryptoJS.SHA3(
							CryptoJS.enc.Latin1.parse( 
								CryptoJS.SHA3(atob(deltas[i].signature_b64).substring(0,32).toString(CryptoJS.enc.Latin1), {outputLength: 256}).toString(CryptoJS.enc.Latin1) + 
								atob(deltas[i].signature_b64).substring(32)
							), 
							{outputLength: 256}
						)
					);
				console.log(uid +"'s wrong sig protoCommit: " + 
					CryptoJS.SHA3(
						CryptoJS.enc.Latin1.parse( 
							atob(deltas[i].signature_b64).substring(0,32) + 
							CryptoJS.SHA3(atob(deltas[i].signature_b64).substring(32).toString(CryptoJS.enc.Latin1), {outputLength: 256}).toString(CryptoJS.enc.Latin1) 
						), 
						{outputLength: 256}
					)
				);

				self.numSigs_Recv++;
				console.log("Received " + self.numSigs_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numSigs_Recv < self.numUsers){
		setTimeout(function() { 
			self.attempt++;
			self.httpclient.syncSignatures(self.userID, self.uidSet, 
				SafeSlinger.util.parseHexString(self.signatureSet[self.userID].toString()), function (response){
					self.syncSignatures(response);
				});
		}, fibonacci(self.attempt) * 1000);
	}else{
		console.log("All sigs received");
		console.log(self.signatureSet);
		
		self.syncKeyNodesRequest(function (response){
			self.syncKeyNodes(response);
		});
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncKeyNodesRequest = function (callback){
	var self = this;
		
	if (self.numUsers == 2) {
		for(var i = 0; i < self.uidSet.length; i++){
			if (self.uidSet[i] != self.userID) {
				var uidOther = self.uidSet[i];
			}
		}
		var dh = new SafeSlinger.DiffieHellman();
		var pub = str2bigInt(self.dhpubkeySet[uidOther].toString(), 16, 1536);
		var pri = str2bigInt(self.dhkey.toString(), 16, 1536);
		self.groupKey = CryptoJS.enc.Hex.parse(bigInt2str(dh.computeSecret(pub, pri), 16));
		console.log("Group Secret Key: " + self.groupKey);

		self.encMatchNonceSet[self.userID] = CryptoJS.AES.encrypt(
				self.matchNonce, 
				getAesKeyWords(self.groupKey), 
				{ iv: getAesIvWords(self.groupKey), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
			).ciphertext;
		console.log("Encrypted Match Nonce: " + self.encMatchNonceSet[self.userID]);
		
		self.syncMatchRequest(function (response){
			self.syncMatch(response);
		});
	} else {
		self.numKeyNodes_Recv = 1;
		self.attempt = 1;
		self.uidSet = [];
		self.uidSet.push(self.userID);
		console.log(self.uidSet);

		// TODO: compute key nodes for 3+

		self.httpclient.syncKeyNodes(self.userID, self.userIdPost, 
				SafeSlinger.util.parseHexString(self.nextNodePubKey.toString()), callback);
	}
}

SafeSlinger.SafeSlingerExchange.prototype.syncKeyNodes = function (response){
	var self = this;
	console.log("********************** SafeSlinger syncKeyNodes ************");
	console.log(response);

	var server = response.ver_server;
	var total = response.node_total;

	if(total < 0){
		self.offset = 16;
		var KeyNode = CryptoJS.enc.Latin1.parse(atob(response.keynode_b64));
		self.keyNodes[uid] = KeyNode;

		console.log(uid +"'s keynode: " + self.keyNodes[uid]);

		self.numKeyNodes_Recv++;
		console.log("Received " + self.numKeyNodes_Recv + "/" + self.numKeyNodes + " Items");
	}
	
	if(self.numKeyNodes_Recv < self.numUsers){
		setTimeout(function() { 
			self.attempt++;
			self.httpclient.syncKeyNodes(self.userID, self.uidSet, 
				SafeSlinger.util.parseHexString(self.nextNodePubKey.toString()), function (response){
					self.syncKeyNodes(response);
				});
		}, fibonacci(self.attempt) * 1000);
	}else{
		console.log("All KeyNodes received");
		console.log(self.keyNodes);

		self.syncMatchRequest(function (response){
			self.syncMatch(response);
		});
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncMatchRequest = function (callback){
	var self = this;
	self.attempt = 1;
	self.numMatch_Recv = 1;
	self.uidSet = [];
	self.uidSet.push(self.userID);
	console.log(self.uidSet);
	
	self.httpclient.syncMatch(self.userID, self.uidSet, 
		SafeSlinger.util.parseHexString(self.encMatchNonceSet[self.userID].toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncMatch = function (response){
	var self = this;
	console.log("********************** SafeSlinger syncMatch ************");
	console.log(response);

	var server = response.ver_server;
	var total = response.match_total;
	var deltas = response.match_deltas;
	console.log(deltas);
	var delta_count = deltas.length;

	if(self.numMatch_Recv < self.numUsers){
		if(delta_count > 0){
			self.offset = 16;
			for(var i = 0 ;i < delta_count; i++){
				var uid = deltas[i].usrid;
				self.uidSet.push(uid);
				var Match = CryptoJS.enc.Latin1.parse(atob(deltas[i].matchnonce_b64));
				self.encMatchNonceSet[uid] = Match;

				console.log(uid +"'s encMatchNonce: " + self.encMatchNonceSet[uid]);

				self.numMatch_Recv++;
				console.log("Received " + self.numMatch_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numMatch_Recv < self.numUsers){
		setTimeout(function() { 
			self.attempt++;
			self.httpclient.syncMatch(self.userID, self.uidSet, 
				SafeSlinger.util.parseHexString(self.encMatchNonceSet[self.userID].toString()), function (response){
					self.syncMatch(response);
				});
		}, fibonacci(self.attempt) * 1000);
	}else{
		console.log("All Match received");
		console.log(self.encMatchNonceSet);

		for(var i = 0 ;i < self.numUsers; i++){
			var uid = self.uidSet[i];
			// decrypt recieved match nonces with shared secret
			var decNonce = CryptoJS.AES.decrypt(
					{ ciphertext: self.encMatchNonceSet[uid] }, 
					getAesKeyWords(self.groupKey), 
					{ iv: getAesIvWords(self.groupKey), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
			);
			self.matchNonceSet[uid] = decNonce;
			console.log(uid +"'s Decrypted Match Nonce: " + self.matchNonceSet[uid]);

		 	// TODO: verify all data received hashes to each previous commitment received
			
			// decrypt recieved data with recieved match nonces
			var decData = CryptoJS.AES.decrypt(
					{ ciphertext: self.receivedcipherSet[uid] }, 
					getAesKeyWords(self.matchNonceSet[uid]), 
					{ iv: getAesIvWords(self.matchNonceSet[uid]), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
			);
			self.dataSet[uid] = CryptoJS.enc.Utf8.stringify(decData);
			console.log(uid +"'s Decrypted Data: " + self.dataSet[uid]);
		}
		// ui must check state from outside for all data elements before continuing
	}
	console.log("done");  
}

function fibonacci(n) {
    if (n == 0) {
        return 0;
    } else if (n == 1) {
        return 1;
    } else {
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}

function getAesKeyWords(key){
	return CryptoJS.SHA3(CryptoJS.enc.Latin1.parse(CryptoJS.enc.Utf8.stringify("1") + CryptoJS.enc.Latin1.stringify(key)), {outputLength: 256});
}

function getAesIvWords(key){
	var words = CryptoJS.SHA3(CryptoJS.enc.Latin1.parse(CryptoJS.enc.Utf8.stringify("2") + CryptoJS.enc.Latin1.stringify(key)), {outputLength: 256});
	var latin = CryptoJS.enc.Latin1.stringify(words);
	var substring = latin.substring(0, 16); // truncate to 128 bits
	return CryptoJS.enc.Latin1.parse(substring);
}

SafeSlinger.SafeSlingerExchange.prototype.getPosition = function () {
	var self = this;	
	return self.correctSelection;
}

SafeSlinger.SafeSlingerExchange.prototype.getHash24Bits = function () {
	var self = this;	
	return SafeSlinger.util.parseHexString(self.hash.toString().substring(0,6));
}

SafeSlinger.SafeSlingerExchange.prototype.getDecoy24Bits1 = function () {
	var self = this;	
	return SafeSlinger.util.parseHexString(self.decoy1.toString().substring(0,6));
}

SafeSlinger.SafeSlingerExchange.prototype.getDecoy24Bits2 = function () {
	var self = this;	
	return SafeSlinger.util.parseHexString(self.decoy2.toString().substring(0,6));
}

SafeSlinger.SafeSlingerExchange.prototype.isDataComplete = function () {
	var self = this;	
	var boolData = Object.keys(self.receivedcipherSet).length >= self.numUsers;
	return boolData;
}

SafeSlinger.SafeSlingerExchange.prototype.getDataSet = function () {
	var self = this;	
	return self.dataSet;
}

SafeSlinger.SafeSlingerExchange.prototype.isMatchComplete = function () {
	var self = this;	
	var boolData = Object.keys(self.dataSet).length == self.numUsers;
	return boolData;
}