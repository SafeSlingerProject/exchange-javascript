/*! 
SafeSlinger 0.1.0
*/
var SafeSlinger = (function (){
	var SafeSlinger = {};
	SafeSlinger.jspack = new JSPack();
SafeSlinger.HTTPSConnection = function (address){
	var self = this;
	self.address = address;
	self.connected = false;
	self.connection = null;
	self.version = 1 << 24 | 8 << 16;
	if(self.address != ""){
		self.connect();
	}
};

SafeSlinger.HTTPSConnection.prototype.connect = function() {
	var self = this;
	var xhr = new XMLHttpRequest();
	self.connection = xhr;
	self.connected = true;
};

SafeSlinger.HTTPSConnection.prototype.doPost = function(name, packetdata, callback) {
	var self = this;
	console.log("Connecting to server: " + self.address);
	self.connection.open("POST", self.address + name, true);
	self.connection.responseType = "arraybuffer";

	self.connection.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	//self.connection.setRequestHeader("Content-Type","application/octet-stream");
	self.connection.onload = function (e){
		var response = self.connection.response;
		console.log(self.connection);
		if(self.connection.status === 200){
			self.response = response;
			console.log("response: " + response + " status:"+ self.connection.status);
			callback(response);
		}else{
			console.log("Network error: return code" + self.connection.status + ", reason = " 
				+ self.connection.statusText);
		}
	};
	self.connection.send(packetdata);
};

SafeSlinger.HTTPSConnection.prototype.doPostAjax = function(name, packetdata, callback) {
	console.log("JSON data");
	console.log(packetdata.ver_client);
	console.log(packetdata.commit_b64);
	var self = this;
	jQuery.ajax({
		url: self.address + name,
		type: "POST",
		processData: false,
		dataType: "json",
		contentType: "text/plain",
		data: JSON.stringify(packetdata),
		crossDomain: true,
		success : function(response){
			console.log("success");
			console.log(response);
			callback(response);
		},
		error : function (response){
			console.log("error");
			console.log(response);
		}
	});
};

SafeSlinger.HTTPSConnection.prototype.assignUser = function(ssExchange, dataCommitment, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** HTTP assignUser *******************");

	//packing the commitment
	var pack = SafeSlinger.jspack.Pack('!' + dataCommitment.length + 'B', dataCommitment);
	console.log(pack);

	//creating binary string
	var packBin = SafeSlinger.util.createBinString(pack);
	console.log("PackLen: " + packBin.length);
	console.log(packBin);
	var dataObj = {
		"ver_client" : String(self.version),
		"commit_b64" : btoa(packBin)
	}
	//self.doPost("/assignUser", packBin, callback);
	self.doPostAjax("/assignUser", dataObj, callback);
};

SafeSlinger.HTTPSConnection.prototype.syncUsers = function(userID, minID, uidSet, dataCommitment, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** HTTP syncUsers *******************");
	console.log("dataCommitment");
	console.log(dataCommitment);
	var pack = SafeSlinger.jspack.Pack('!' + dataCommitment.length + 'B', dataCommitment);
	//var pack = SafeSlinger.jspack.Pack('!' + num_item + 'i' + (dataCommitment.length-num_item) + 'B', dataCommitment);
	//pack = meta;
	console.log("pack");
	console.log(pack);
	var packBin = SafeSlinger.util.createBinString(pack);
	console.log("packBin");
	console.log(packBin);
	console.log("PackLen: " + packBin.length);

	var dataObj = {
		"ver_client" : String(self.version),
		"usrid" : String(userID),
		"usridlink" : String(minID),
		"usrids" : uidSet,
		"commit_b64" : btoa(packBin)
	}

	self.doPostAjax('/syncUsers', dataObj, callback); 
}

SafeSlinger.HTTPSConnection.prototype.syncData = function(userID, protocolCommitment, dhpubkey, uidSet, encryptedData, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** HTTP syncData *******************");
	//var commit = protocolCommitment + dhpubkey + encryptedData;
	var commit = protocolCommitment.concat(dhpubkey).concat(encryptedData);
	console.log("commit");
	console.log(commit);
	var pack = SafeSlinger.jspack.Pack('!' + commit.length + 'B', commit);
	console.log("pack");
	console.log(pack);

	var packBin  = SafeSlinger.util.createBinString(pack);
	console.log("packBin");
	console.log(packBin);
	console.log("PackLen: " + packBin.length);

	var dataObj = {
		"ver_client" : String(self.version),
		"usrid" : String(userID),
		"usrids" : uidSet,
		"data_b64" : btoa(packBin)
	}

	self.doPostAjax('/syncData', dataObj, callback);
}

SafeSlinger.HTTPSConnection.prototype.syncSignatures = function(userID, uidSet, sig, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** HTTP syncSignatures *******************");
	console.log("sig");
	console.log(sig);
	var pack = SafeSlinger.jspack.Pack('!' + sig.length + 'B', sig);
	console.log("pack");
	console.log(pack);
	var packBin = SafeSlinger.util.createBinString(pack);
	console.log("packBin");
	console.log(packBin);
	console.log("PackLen: " + packBin.length);

	var dataObj = {
		"ver_client" : String(self.version),
		"usrid" : String(userID),
		"usrids" : uidSet,
		"signature_b64" : btoa(packBin)
	}

	self.doPostAjax('/syncSignatures', dataObj, callback);
}

SafeSlinger.HTTPSConnection.prototype.syncKeyNodes = function(userID, usridpost, keynode, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** HTTP syncKeyNodes *******************");
	console.log("keynode");
	console.log(keynode);
	var pack = SafeSlinger.jspack.Pack('!' + keynode.length + 'B', keynode);
	console.log("pack");
	console.log(pack);
	var packBin = SafeSlinger.util.createBinString(pack);
	console.log("packBin");
	console.log(packBin);
	console.log("PackLen: " + packBin.length);

	var dataObj = {
		"ver_client" : String(self.version),
		"usrid" : String(userID),
		"usridpost" : String(usridpost),
		"keynode_b64" : btoa(packBin)
	}

	self.doPostAjax('/syncKeyNodes', dataObj, callback);
}

SafeSlinger.HTTPSConnection.prototype.syncMatch = function(userID, uidSet, matchNonce, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** HTTP syncMatch *******************");
	console.log("matchNonce");
	console.log(matchNonce);
	var pack = SafeSlinger.jspack.Pack('!' + matchNonce.length + 'B', matchNonce);
	console.log("pack");
	console.log(pack);
	var packBin = SafeSlinger.util.createBinString(pack);
	console.log("packBin");
	console.log(packBin);
	console.log("PackLen: " + packBin.length);

	var dataObj = {
		"ver_client" : String(self.version),
		"usrid" : String(userID),
		"usrids" : uidSet,
		"matchnonce_b64" : btoa(packBin)
	}

	self.doPostAjax('/syncMatch', dataObj, callback);
}


SafeSlinger.SafeSlingerExchange = function (address){
	var self = this;

	// TODO: check at runtime for compatible browsers supporting CryptoJS.SHA3
	
	// TODO: check at runtime for compatible browsers supporting typed arrays:
	// Chrome 7
	// Firefox (Gecko) 4.0 (2)
	// Internet Explorer 10
	// Opera 11.6
	// Safari 5.1
	// Android 4
	// Chrome for Android (Yes)
	// Firefox Mobile (Gecko) 4.0 (2)
	// IE Mobile 10
	// Opera Mobile 11.6
	// Safari Mobile 4.2
	
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
	//self.matchExtraHashSet = {};
	//self.wrongHashSet = {};
	//self.matchHashSet = {};
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
	
	// TODO: Developer notes that SHA3 should be named Keccak[c=2d].
	
	//	self.matchNonce = new Uint32Array(8);
	//	self.joinedMatchNonce = "";
	//	//console.log(self.matchNonce.join());
	//	window.crypto.getRandomValues(self.matchNonce);
	//	for(var i=0; i<8; i++){
	//		//console.log(self.matchNonce[i]);
	//		self.joinedMatchNonce += self.matchNonce[i].toString();
	//	}
	self.matchNonce = CryptoJS.lib.WordArray.random(256/8);	
	console.log("Match Nonce: " + self.matchNonce);
	//	self.wrongNonce = new Uint32Array(8);
	//	self.joinedWrongNonce = "";
	//	window.crypto.getRandomValues(self.wrongNonce);
	//	for(var i=0; i<8; i++){
	//		//console.log(self.matchNonce[i]);
	//		self.joinedWrongNonce += self.wrongNonce[i].toString();
	//	}
	self.wrongNonce = CryptoJS.lib.WordArray.random(256/8);	
	console.log("Wrong Nonce: " + self.wrongNonce);
	self.matchExtrahash = CryptoJS.SHA3(self.matchNonce, {outputLength: 256});
	self.wrongHash = CryptoJS.SHA3(self.wrongNonce, {outputLength: 256});
	self.matchHash = CryptoJS.SHA3(self.matchExtrahash, {outputLength: 256});
	console.log("Match Extra Hash: " + self.matchExtrahash.toString());
	console.log("Match Hash: " + self.matchHash.toString());
	console.log("Wrong Hash: " + self.wrongHash.toString());

	// TODO: refactor IV/Key generating methods
	var iv  = CryptoJS.lib.WordArray.random(128/8);
	self.encryptedData = CryptoJS.AES.encrypt(data, self.matchNonce, { iv: iv }).ciphertext;
	console.log("Encrypted Data: " + self.encryptedData.toString());

	self.protocolCommitment = CryptoJS.SHA3(self.matchHash + self.wrongHash, {outputLength: 256});
	console.log("Protocol Commitment: " + self.protocolCommitment);

	self.dh = new SafeSlinger.DiffieHellman();
	self.dh.genKeys();
	self.dh.showParams();
	self.dhpubkey = self.dh.publicKey;
	self.dhkey = self.dh.privateKey;
	self.dhkeyLen = self.dhkey.length;

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
	console.log("********************** Safeslinger assignUser ************");
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
	console.log(bigInt2str(self.dhpubkeySet[self.userID], 10));
	console.log(self.receivedcipherSet[self.userID].toString());
	return self.userID;
}

SafeSlinger.SafeSlingerExchange.prototype.syncUsersRequest = function (lowNum, callback){
	var self = this;
	self.lowNum = lowNum;
	self.numUsers_Recv = 1;
	self.uidSet.push(self.userID);
	console.log(self.uidSet);
	
	self.httpclient.syncUsers(self.userID, lowNum, self.uidSet, 
		SafeSlinger.util.parseHexString(self.dataCommitment.toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncUsers = function (response){
	var self = this;
	// var minVersion = SafeSlinger.jspack.Unpack('!i', response, 4)[0];
	// console.log(minVersion);
	// var count = SafeSlinger.jspack.Unpack('!i', response, 8)[0];
	// console.log("count " + count);
	// var delta_count = SafeSlinger.jspack.Unpack('!i', response, 12)[0];
	// console.log("deltacount " + delta_count);
	console.log("********************** Safeslinger syncUsers ************");
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
				var commitment = atob(deltas[i].commit_b64);
				self.dataCommitmentSet[uid] = commitment;
				self.numUsers_Recv += 1;
				console.log("Received " + self.numUsers_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numUsers_Recv < self.numUsers){
		// TODO: add fibonacci backoff interval for setTimeout
		setTimeout(function() { 
			self.httpclient.syncUsers(self.userID, self.lowNum, self.uidSet, 
				SafeSlinger.util.parseHexString(self.dataCommitment.toString()), function (response){
					self.syncUsers(response);
				});
		}, 5000);
	}else{
		console.log("All commitments received");
		console.log(self.dataCommitmentSet);
		
	 	// TODO: verify all commits are appropriately sized
	 	
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
	var dhpubkey = SafeSlinger.util.parseHexString(bigInt2str(self.dhpubkey, 16));
	var encryptedData = SafeSlinger.util.parseHexString(self.encryptedData.toString());

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

	 if(self.numData_Recv < self.numUsers){
	 	if(delta_counts > 0){
	 		for(var i = 0; i < delta_counts; i++){
				var uid = data_deltas[i].usrid;
	 			self.uidSet.push(uid);
				
	 			var data = atob(data_deltas[i].data_b64);
				self.protoCommitmentSet[uid] = data.substring(0, 32);
				self.dhpubkeySet[uid] = data.substring(32, 32 + 192);
				self.receivedcipherSet[uid] = data.substring(32 + 192);
				
				console.log("User id -->" + uid);
	 			console.log("data --> " + data);

	 			self.numData_Recv += 1;
	 			console.log("Received " + self.numData_Recv + "/" + self.numUsers + " Items");
	 		}
	 	}
	 }

	 if(self.numData_Recv < self.numUsers){
	 	var protoCommit = SafeSlinger.util.parseHexString(self.protocolCommitment.toString());
		var dhpubkey = SafeSlinger.util.parseHexString(bigInt2str(self.dhpubkey, 16));
		var encryptedData = SafeSlinger.util.parseHexString(self.encryptedData.toString());
		
		// TODO: add fibonacci backoff interval for setTimeout
		setTimeout(function() { 			
		 	self.httpclient.syncData(self.userID, protoCommit, 
		 		dhpubkey, self.uidSet, encryptedData, function (response){
				self.syncData(response);
			});
		}, 5000);
	 }else{
		console.log("All data received");
		console.log(self.protoCommitmentSet);
		console.log(self.dhpubkeySet);
		console.log(self.receivedcipherSet);

	 	// TODO: verify all data received hashes to each previous commitment received
	 	
		var hash = "";
		self.uidSet.sort();
 		for(var i = 0; i < self.uidSet.length; i++){
			var uid = self.uidSet[i];
			hash += self.protoCommitmentSet[uid];
			hash += self.dhpubkeySet[uid];
			hash += self.receivedcipherSet[uid];
 		}
		self.hash = CryptoJS.SHA3(hash, {outputLength: 256});

		// TODO: assign deterministic decoy values
		self.decoy1 = CryptoJS.lib.WordArray.random(24/8);	
		self.decoy2 = CryptoJS.lib.WordArray.random(24/8);	

		// TODO: randomize correct selection
		self.correctSelection = 1;
				
		// ui must check state from outside for all data elements before continuing
	 }
	 console.log("done");  
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

SafeSlinger.SafeSlingerExchange.prototype.syncSignaturesRequest = function (position, callback){
	var self = this;
	self.numSigs_Recv = 1;
	self.uidSet = [];
	self.uidSet.push(self.userID);
	console.log(self.uidSet);

	if (position == self.correctIndex) {
		var match1 = SafeSlinger.util.parseHexString(self.matchExtrahash.toString());
		var match2 = SafeSlinger.util.parseHexString(self.wrongNonce.toString());
		var sig = match1.concat(match2);
	} else {
		var wrong1 = SafeSlinger.util.parseHexString(self.matchHash.toString());
		var wrong2 = SafeSlinger.util.parseHexString(self.matchWrong.toString());
		var sig = wrong1.concat(wrong2);
	}
	self.sig = sig;
	self.signatureSet[self.userID] = self.sig;
	console.log(self.signatureSet[self.userID].toString());
	
	self.httpclient.syncSignatures(self.userID, self.uidSet, 
		SafeSlinger.util.parseHexString(self.signatureSet[self.userID].toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncSignatures = function (response){
	var self = this;
	console.log("********************** Safeslinger syncSignatures ************");
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
				var sig = atob(deltas[i].signature_b64);
				self.signatureSet[uid] = sig;
				self.numSigs_Recv += 1;
				console.log("Received " + self.numSigs_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numSigs_Recv < self.numUsers){
	 	// TODO: add fibonacci backoff interval for setTimeout
		setTimeout(function() { 
			self.httpclient.syncSignatures(self.userID, self.uidSet, 
				SafeSlinger.util.parseHexString(self.signatureSet[self.userID].toString()), function (response){
					self.syncSignatures(response);
				});
		}, 5000);
	}else{
		console.log("All sigs received");
		console.log(self.signatureSet);
		
	 	// TODO: verify all data received hashes to each previous commitment received
		
		self.syncKeyNodesRequest(function (response){
			self.syncKeyNodes(response);
		});
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncKeyNodesRequest = function (callback){
	var self = this;
		
	// TODO: compute keys nodes and shared secret
	if (self.numUsers == 2) {
		for(var i = 0; i < self.uidSet.length; i++){
			if (self.uidSet[i] != self.userID) {
				var uidOther = self.uidSet[i];
			}
		}
		var dh = new SafeSlinger.DiffieHellman();
		self.groupKey = dh.computeSecret(self.dhpubkeySet[uidOther], self.dhkey);
		console.log(self.groupKey);

		var iv  = CryptoJS.lib.WordArray.random(128/8);
		self.encMatchNonceSet[self.userID] = CryptoJS.AES.encrypt(self.groupKey, self.matchNonce, { iv: iv }).ciphertext;
		self.syncMatchRequest(function (response){
			self.syncMatch(response);
		});
	} else {
		self.numKeyNodes_Recv = 1;
		self.uidSet = [];
		self.uidSet.push(self.userID);
		console.log(self.uidSet);

		self.httpclient.syncKeyNodes(self.userID, self.userIdPost, 
				SafeSlinger.util.parseHexString(self.nextNodePubKey.toString()), callback);
	}
}

SafeSlinger.SafeSlingerExchange.prototype.syncKeyNodes = function (response){
	var self = this;
	console.log("********************** Safeslinger syncKeyNodes ************");
	console.log(response);

	var server = response.ver_server;
	var total = response.node_total;

	if(total < 0){
		self.offset = 16;
		var KeyNode = atob(response.keynode_b64);
		self.keyNodes[uid] = KeyNode;
		self.numKeyNodes_Recv += 1;
		console.log("Received " + self.numKeyNodes_Recv + "/" + self.numKeyNodes + " Items");
	}
	
	if(self.numKeyNodes_Recv < self.numUsers){
		// TODO: add fibonacci backoff interval for setTimeout
		setTimeout(function() { 
			self.httpclient.syncKeyNodes(self.userID, self.uidSet, 
				SafeSlinger.util.parseHexString(self.nextNodePubKey.toString()), function (response){
					self.syncKeyNodes(response);
				});
		}, 5000);
	}else{
		console.log("All KeyNodes received");
		console.log(self.keyNodes);

	 	// TODO: verify all data received hashes to each previous commitment received
		
		self.syncMatchRequest(function (response){
			self.syncMatch(response);
		});
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.syncMatchRequest = function (callback){
	var self = this;
	self.numMatch_Recv = 1;
	self.uidSet = [];
	self.uidSet.push(self.userID);
	console.log(self.uidSet);
	
	// TODO: encrypt match nonce with shared secret

	self.httpclient.syncMatch(self.userID, self.uidSet, 
		SafeSlinger.util.parseHexString(self.encMatchNonceSet[self.userID].toString()), callback);
}

SafeSlinger.SafeSlingerExchange.prototype.syncMatch = function (response){
	var self = this;
	console.log("********************** Safeslinger syncMatch ************");
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
				var Match = atob(deltas[i].matchnonce_b64);
				self.encMatchNonceSet[uid] = Match;
				self.numMatch_Recv += 1;
				console.log("Received " + self.numMatch_Recv + "/" + self.numUsers + " Items");
			}
		}
	}
	
	if(self.numMatch_Recv < self.numUsers){
		// TODO: add fibonacci backoff interval for setTimeout
		setTimeout(function() { 
			self.httpclient.syncMatch(self.userID, self.uidSet, 
				SafeSlinger.util.parseHexString(self.encMatchNonceSet[self.userID].toString()), function (response){
					self.syncMatch(response);
				});
		}, 5000);
	}else{
		console.log("All Match received");
		console.log(self.encMatchNonceSet);

	 	// TODO: verify all data received hashes to each previous commitment received
		
		for(var i = 0 ;i < self.numUsers; i++){
			var uid = uidSet[i];
			// decrypt recieved match nonces with shared secret
			var iv  = CryptoJS.lib.WordArray.random(128/8);
			self.matchNonceSet[uid] = CryptoJS.AES.decrypt({ ciphertext: self.encMatchNonceSet[uid] }, self.groupKey, { iv: iv }).ciphertext;
			// decrypt recieved data with recieved match nonces
			var iv  = CryptoJS.lib.WordArray.random(128/8);
			self.dataSet[uid] = CryptoJS.AES.decrypt({ ciphertext: self.receivedcipherSet[uid] }, self.matchNonceSet[uid], { iv: iv }).ciphertext;
		}
	}
	console.log("done");  
}

SafeSlinger.SafeSlingerExchange.prototype.isMatchComplete = function () {
	var self = this;	
	var boolData = Object.keys(self.dataSet).length == self.numUsers;
	return boolData;
}
SafeSlinger.DiffieHellman = function () {
	var self = this;
	self.primeStr = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA237327FFFFFFFFFFFFFFFF";
	self.prime = str2bigInt(self.primeStr, 16, 1536);
	//self.prime = randTruePrime(1536);
	self.generatorStr = "02";
	self.generator = str2bigInt(self.generatorStr, 16, 4);
};

SafeSlinger.DiffieHellman.prototype.genKeys = function (){
	var self = this;
	self.privateKey = randBigInt(1536);
	console.log(bigInt2str(powMod(self.generator, self.privateKey, self.prime), 16));
	self.publicKey = powMod(self.generator, self.privateKey, self.prime);
}

SafeSlinger.DiffieHellman.prototype.computeSecret = function (pubKey, privateKey){
	var self = this;
	console.log(bigInt2str(powMod(pubKey, privateKey, self.prime), 16));
	return powMod(pubKey, privateKey, self.prime);
}

SafeSlinger.DiffieHellman.prototype.showParams = function (){
	var self = this;
	console.log("Prime: " + bigInt2str(self.prime, 16));
	console.log("Generator: " + bigInt2str(self.generator, 16));
	console.log("Private Key: " + bigInt2str(self.privateKey,16));
	console.log("Public Key: "  + bigInt2str(self.publicKey, 16));
}
SafeSlinger.util = {};

SafeSlinger.util.parseHexString = function (str){
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
    }

    return result;
};

SafeSlinger.util.createHexString = function (arr) {
    var result = "";
    var z;

    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);

        z = 2 - str.length + 1;
        str = Array(z).join("0") + str;

        result += str;
    }

    return result;
};

SafeSlinger.util.createBinString = function (arr) {
    var retStr = "";
    for(var i=0;i<arr.length; i++){
        retStr = retStr + String.fromCharCode(arr[i]);
    }
    return retStr;
};

SafeSlinger.util.getNumberPhrase = function (arr){
	return (arr[0]+1) + " " + (arr[1]+256+1) + " " + (arr[2]+1);
}


	return SafeSlinger;
})();