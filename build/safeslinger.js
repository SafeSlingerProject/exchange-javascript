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
	console.log("Connecting to server" + self.address);
	self.connection.open("POST", self.address + name, true);

	self.connection.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	self.connection.onload = function (e){
		var response = self.connection.response;
		console.log(self.connection);
		if(self.connection.status === 200){
			self.response = response;
			console.log("response: " + response + " status:"+ self.connection.status);
			self.userID = (SafeSlinger.jspack.Unpack('!i', response, 4))[0];
			console.log("Assigned ID: " + self.userID);
			callback();
		}else{
			console.log("Network error: return code" + self.connection.status + ", reason = " 
				+ self.connection.statusText);
		}
	};
	self.connection.send(packetdata);
};

SafeSlinger.HTTPSConnection.prototype.assignUser = function(dataCommitment) {
	var self = this;
	if(!self.connected)
		return null;
	dataCommitment.unshift(0);
	dataCommitment[0] = self.version;
	console.log("version: " + self.version);
	var pack = SafeSlinger.jspack.Pack('!i' + (dataCommitment.length-1) + 'B', dataCommitment);
	console.log(pack);
	self.doPost("/assignUser", pack, function () {
		console.log("requested");
	});

};

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
	return SafeSlinger;
})();