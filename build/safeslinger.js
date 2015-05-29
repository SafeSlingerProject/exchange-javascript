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

	//packing the commitment
	var pack = SafeSlinger.jspack.Pack('!' + (dataCommitment.length-1) + 'B', dataCommitment);
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

SafeSlinger.HTTPSConnection.prototype.sendMinID = function(userID, minID, uidSet, dataCommitment, callback) {
	var self = this;
	if(!self.connected)
		return null;
	console.log("************** Send Min Id *******************");
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
	console.log("************** HTTP SyncData *******************");
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
SafeSlinger.DiffieHellman = function () {
	var self = this;
	self.primeStr = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA237327FFFFFFFFFFFFFFFF";
	self.prime = str2bigInt(self.primeStr, 16, 1536);
	//self.prime = randTruePrime(1536);
	self.generator = 2;
	self.privateKey = self.genPrivateKey(511);
	self.publicKey = self.genPublicKey();
};

SafeSlinger.DiffieHellman.prototype.genPrivateKey = function (bits){
	return randBigInt(bits);
};

SafeSlinger.DiffieHellman.prototype.genPublicKey = function (){
	var self = this;
	console.log(bigInt2str(powMod(int2bigInt(self.generator, 16, 4), self.privateKey, self.prime), 16));
	return powMod(int2bigInt(self.generator, 16, 5), self.privateKey, self.prime);
}

SafeSlinger.DiffieHellman.prototype.showParams = function (){
	var self = this;
	console.log("Prime: " + bigInt2str(self.prime, 16));
	console.log("Generator: " + self.generator);
	console.log("Private Key: " + bigInt2str(self.privateKey,16));
	console.log("Public Key: "  + bigInt2str(self.publicKey, 10));
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
	return SafeSlinger;
})();