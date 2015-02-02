/*! 
SafeSlinger 0.1.0
*/
var SafeSlinger = (function (){
	var SafeSlinger = {};
SafeSlinger.HTTPSConnection = function (url, secret){
	this.url = url;
	this.secret = secret;
};

SafeSlinger.HTTPSConnection.prototype.doPost = function(name, packetdata, callback) {
	var self = this;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", self.url + name, true);
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.onload = function (e){
		var response = xhr.response;
		console.log(xhr);
		if(xhr.status === 200){
			self.response = response;
			console.log(response + xhr.status);
			callback();
		}else{
			console.log("Network error: return code" + xhr.status + ", reason = " + xhr.statusText);
		}
	};
	xhr.send(self.secret);
};

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
	return SafeSlinger;
})();