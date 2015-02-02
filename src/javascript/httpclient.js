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
