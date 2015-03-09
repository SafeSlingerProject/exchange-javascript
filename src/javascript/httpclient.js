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

SafeSlinger.HTTPSConnection.prototype.assignUser = function(ssExchange, dataCommitment, callback) {
	var self = this;
	if(!self.connected)
		return null;
	dataCommitment.unshift(0);
	dataCommitment[0] = self.version;
	console.log("version: " + self.version);
	var pack = SafeSlinger.jspack.Pack('!i' + (dataCommitment.length-1) + 'B', dataCommitment);
	console.log(pack);
	self.doPost("/assignUser", pack, callback);
};

SafeSlinger.HTTPSConnection.prototype.sendMinID = function(userID, minID, uidSet, dataCommitment, callback) {
	var self = this;
	if(!self.connected)
		return null;
	var num_item = 4 + uidSet.length;
	var pack = SafeSlinger.jspack.Pack('!' + num_item + 'i', self.version, userID, minID, uidSet.length, uidSet);
	pack += SafeSlinger.jspack.Pack('!' + dataCommitment.length + 'B', dataCommitment);
	console.log("setMinID");
	console.log(pack);
	self.doPost('/syncUsers', pack, callback); 
}
