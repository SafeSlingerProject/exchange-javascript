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