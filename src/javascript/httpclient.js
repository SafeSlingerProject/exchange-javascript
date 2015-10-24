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

