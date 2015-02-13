SafeSlinger.HTTPSConnection = function (address){
	var self = this;
	self.address = address;
	self.connected = false;
	self.connection = null;
	if(self.address != ""){
		self.connect();
	}
};

SafeSlinger.HTTPSConnection.prototype.connect = function() {
	var self = this;
	console.log("Connecting to server" + self.address);
	var xhr = new XMLHttpRequest();
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
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
