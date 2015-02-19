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
