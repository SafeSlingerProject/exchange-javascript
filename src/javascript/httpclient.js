SafeSlinger.HTTPSConnection = function (url, secret){
	this.url = url;
	this.secret = secret;
};

SafeSlinger.HTTPSConnection.prototype.doPost = function(name, packetdata) {
	var self = this;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", self.url + name, false);
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.onload = function (e){
		var response = xhr.response;
		console.log(xhr);
		if(xhr.status === 200){
			console.log(response + xhr.status);
		}else{
			console.log("Network error: return code" + xhr.status + ", reason = " + xhr.statusText);
		}
	};
	xhr.send(self.secret);
};
