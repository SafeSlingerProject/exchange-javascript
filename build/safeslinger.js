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

SafeSlinger.HTTPSConnection.prototype.assignUser = function(dataCommitment, callback) {
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
	self.correctSig = false;

	if (selectedHash != null && selectedHash.toString() == self.getHash24Bits().toString()) {
		self.correctSig = true;
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

		if (!self.correctSig){
			return;
		}
		
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
SafeSlinger.DiffieHellman = function () {
	var self = this;
	self.primeStr = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA237327FFFFFFFFFFFFFFFF";
	self.prime = str2bigInt(self.primeStr, 16, 1536);
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
	console.log("Private Key: " + bigInt2str(self.privateKey, 16));
	console.log("Public Key: "  + bigInt2str(self.publicKey, 16));
}
SafeSlinger.util = {};

SafeSlinger.util.parseHexString = function(str) {
	var result = [];
	while (str.length >= 2) {
		result.push(parseInt(str.substring(0, 2), 16));

		str = str.substring(2, str.length);
	}

	return result;
};

SafeSlinger.util.createHexString = function(arr) {
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

SafeSlinger.util.createBinString = function(arr) {
	var retStr = "";
	for (var i = 0; i < arr.length; i++) {
		retStr = retStr + String.fromCharCode(arr[i]);
	}
	return retStr;
};

SafeSlinger.util.getNumberPhrase = function(arr) {
	return (arr[0] + 1) + " " + (arr[1] + 256 + 1) + " " + (arr[2] + 1);
}

SafeSlinger.util.getWordPhrase = function(arr) {
	return (evenWords[arr[0]]) + " " + (oddWords[arr[1]]) + " "
			+ (evenWords[arr[2]]);
}

var evenWords = [ "aardvark", "absurd", "accrue", "acme", "adrift", "adult",
		"afflict", "ahead", "aimless", "Algol", "allow", "alone", "ammo",
		"ancient", "apple", "artist", "assume", "Athens", "atlas", "Aztec",
		"baboon", "backfield", "backward", "banjo", "beaming", "bedlamp",
		"beehive", "beeswax", "befriend", "Belfast", "berserk", "billiard",
		"bison", "blackjack", "blockade", "blowtorch", "bluebird", "bombast",
		"bookshelf", "brackish", "breadline", "breakup", "brickyard",
		"briefcase", "Burbank", "button", "buzzard", "cement", "chairlift",
		"chatter", "checkup", "chisel", "choking", "chopper", "Christmas",
		"clamshell", "classic", "classroom", "cleanup", "clockwork", "cobra",
		"commence", "concert", "cowbell", "crackdown", "cranky", "crowfoot",
		"crucial", "crumpled", "crusade", "cubic", "dashboard", "deadbolt",
		"deckhand", "dogsled", "dragnet", "drainage", "dreadful", "drifter",
		"dropper", "drumbeat", "drunken", "Dupont", "dwelling", "eating",
		"edict", "egghead", "eightball", "endorse", "endow", "enlist", "erase",
		"escape", "exceed", "eyeglass", "eyetooth", "facial", "fallout",
		"flagpole", "flatfoot", "flytrap", "fracture", "framework", "freedom",
		"frighten", "gazelle", "Geiger", "glitter", "glucose", "goggles",
		"goldfish", "gremlin", "guidance", "hamlet", "highchair", "hockey",
		"indoors", "indulge", "inverse", "involve", "island", "jawbone",
		"keyboard", "kickoff", "kiwi", "klaxon", "locale", "lockup", "merit",
		"minnow", "miser", "Mohawk", "mural", "music", "necklace", "Neptune",
		"newborn", "nightbird", "Oakland", "obtuse", "offload", "optic",
		"orca", "payday", "peachy", "pheasant", "physique", "playhouse",
		"Pluto", "preclude", "prefer", "preshrunk", "printer", "prowler",
		"pupil", "puppy", "python", "quadrant", "quiver", "quota", "ragtime",
		"ratchet", "rebirth", "reform", "regain", "reindeer", "rematch",
		"repay", "retouch", "revenge", "reward", "rhythm", "ribcage",
		"ringbolt", "robust", "rocker", "ruffled", "sailboat", "sawdust",
		"scallion", "scenic", "scorecard", "Scotland", "seabird", "select",
		"sentence", "shadow", "shamrock", "showgirl", "skullcap", "skydive",
		"slingshot", "slowdown", "snapline", "snapshot", "snowcap",
		"snowslide", "solo", "southward", "soybean", "spaniel", "spearhead",
		"spellbind", "spheroid", "spigot", "spindle", "spyglass", "stagehand",
		"stagnate", "stairway", "standard", "stapler", "steamship", "sterling",
		"stockman", "stopwatch", "stormy", "sugar", "surmount", "suspense",
		"sweatband", "swelter", "tactics", "talon", "tapeworm", "tempest",
		"tiger", "tissue", "tonic", "topmost", "tracker", "transit", "trauma",
		"treadmill", "Trojan", "trouble", "tumor", "tunnel", "tycoon", "uncut",
		"unearth", "unwind", "uproot", "upset", "upshot", "vapor", "village",
		"virus", "Vulcan", "waffle", "wallet", "watchword", "wayside",
		"willow", "woodlark", "Zulu", ];

var oddWords = [ "adroitness", "adviser", "aftermath", "aggregate", "alkali",
		"almighty", "amulet", "amusement", "antenna", "applicant", "Apollo",
		"armistice", "article", "asteroid", "Atlantic", "atmosphere",
		"autopsy", "Babylon", "backwater", "barbecue", "belowground",
		"bifocals", "bodyguard", "bookseller", "borderline", "bottomless",
		"Bradbury", "bravado", "Brazilian", "breakaway", "Burlington",
		"businessman", "butterfat", "Camelot", "candidate", "cannonball",
		"Capricorn", "caravan", "caretaker", "celebrate", "cellulose",
		"certify", "chambermaid", "Cherokee", "Chicago", "clergyman",
		"coherence", "combustion", "commando", "company", "component",
		"concurrent", "confidence", "conformist", "congregate", "consensus",
		"consulting", "corporate", "corrosion", "councilman", "crossover",
		"crucifix", "cumbersome", "customer", "Dakota", "decadence",
		"December", "decimal", "designing", "detector", "detergent",
		"determine", "dictator", "dinosaur", "direction", "disable",
		"disbelief", "disruptive", "distortion", "document", "embezzle",
		"enchanting", "enrollment", "enterprise", "equation", "equipment",
		"escapade", "Eskimo", "everyday", "examine", "existence", "exodus",
		"fascinate", "filament", "finicky", "forever", "fortitude",
		"frequency", "gadgetry", "Galveston", "getaway", "glossary",
		"gossamer", "graduate", "gravity", "guitarist", "hamburger",
		"Hamilton", "handiwork", "hazardous", "headwaters", "hemisphere",
		"hesitate", "hideaway", "holiness", "hurricane", "hydraulic",
		"impartial", "impetus", "inception", "indigo", "inertia", "infancy",
		"inferno", "informant", "insincere", "insurgent", "integrate",
		"intention", "inventive", "Istanbul", "Jamaica", "Jupiter", "leprosy",
		"letterhead", "liberty", "maritime", "matchmaker", "maverick",
		"Medusa", "megaton", "microscope", "microwave", "midsummer",
		"millionaire", "miracle", "misnomer", "molasses", "molecule",
		"Montana", "monument", "mosquito", "narrative", "nebula", "newsletter",
		"Norwegian", "October", "Ohio", "onlooker", "opulent", "Orlando",
		"outfielder", "Pacific", "pandemic", "Pandora", "paperweight",
		"paragon", "paragraph", "paramount", "passenger", "pedigree",
		"Pegasus", "penetrate", "perceptive", "performance", "pharmacy",
		"phonetic", "photograph", "pioneer", "pocketful", "politeness",
		"positive", "potato", "processor", "provincial", "proximate",
		"puberty", "publisher", "pyramid", "quantity", "racketeer",
		"rebellion", "recipe", "recover", "repellent", "replica", "reproduce",
		"resistor", "responsive", "retraction", "retrieval", "retrospect",
		"revenue", "revival", "revolver", "sandalwood", "sardonic", "Saturday",
		"savagery", "scavenger", "sensation", "sociable", "souvenir",
		"specialist", "speculate", "stethoscope", "stupendous", "supportive",
		"surrender", "suspicious", "sympathy", "tambourine", "telephone",
		"therapist", "tobacco", "tolerance", "tomorrow", "torpedo",
		"tradition", "travesty", "trombonist", "truncated", "typewriter",
		"ultimate", "undaunted", "underfoot", "unicorn", "unify", "universe",
		"unravel", "upcoming", "vacancy", "vagabond", "vertigo", "Virginia",
		"visitor", "vocalist", "voyager", "warranty", "Waterloo", "whimsical",
		"Wichita", "Wilmington", "Wyoming", "yesteryear", "Yucatan", ];
	return SafeSlinger;
})();