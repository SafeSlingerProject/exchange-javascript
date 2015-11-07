SafeSlingerUI.prototype.showServerSecretView = function(unique_group_name,
		attempt_name, numUsers) {
	var self = this;

	console.log("unique_group_name --> " + unique_group_name);
	console.log("attempt_name --> " + attempt_name);
	console.log("numUsers --> " + numUsers);

	// debugging test
	if (numUsers == null) {
		numUsers = 2;
	}

	// prevent single users from launching exchange
	if (numUsers < 2) {
		return false;
	}

	// --- creating users div ---//
	var usersDiv = document.createElement("div");
	usersDiv.id = "users-div";
	usersDiv.insertAdjacentHTML("afterbegin", "Number of Users: " + numUsers);
	self.container.appendChild(usersDiv);

	// --- creating groupname div and input box---//
	var groupnameDiv = document.createElement("div");
	groupnameDiv.id = "groupname-div";
	if (unique_group_name == null || unique_group_name == "") {
		var groupnameInput = document.createElement("input");
		groupnameInput.type = "text";
		groupnameInput.id = "group-name";
		groupnameDiv.insertAdjacentHTML("afterbegin", "Group Name: ");
		groupnameDiv.appendChild(groupnameInput);
		self.container.appendChild(groupnameDiv);
	} else {
		// groupnameDiv.insertAdjacentHTML("afterbegin", "Group Name: " +
		// unique_group_name);
		groupnameDiv.insertAdjacentHTML("afterbegin", "Attempt: "
				+ attempt_name);
		self.container.appendChild(groupnameDiv);
	}

	// --- creating secret div and input box---//
	var secretDiv = document.createElement("div");
	secretDiv.id = "secret-div";
	var secretInput = document.createElement("input");
	secretInput.type = "text";
	secretInput.id = "secret-input";
	// secretInput.value = "js-demo";
	secretDiv.insertAdjacentHTML("afterbegin", "Secret: ");
	secretDiv.appendChild(secretInput);
	self.container.appendChild(secretDiv);

	// --- Submit button ----//
	var button = document.createElement("input");
	button.type = "submit";
	button.value = "Begin Exchange";
	button.id = "server-submit";
	button.addEventListener('click', function() {

		// button click requires secret, others do not need
		var secret = document.getElementById("secret-input").value;
		console.log("secret: " + secret);
		if (secret == null || secret == "") {
			return false;
		}

		// after secret confirmed valid, let others know...
		if (unique_group_name != null && unique_group_name != "") {
			// trigger hangouts state object to start exchange
			setExchangeActive(true);
		}

		self.beginExchange(unique_group_name, attempt_name, numUsers, secret);

	}, false);
	self.container.appendChild(button);
};

SafeSlingerUI.prototype.beginExchange = function(unique_group_name,
		attempt_name, numUsers, secret) {
	var self = this;

	self.secret = secret;

	var ssExchange = new SafeSlinger.SafeSlingerExchange(
			"https://01060000t-dot-slinger-dev.appspot.com");
	self.ssExchange = ssExchange;
	self.ssExchange.numUsers = numUsers;
	console.log("numUsers: " + self.ssExchange.numUsers);

	var grpname = null;
	if (unique_group_name == null || unique_group_name == "") {
		grpname = document.getElementById("group-name").value;
	} else {
		grpname = unique_group_name + attempt_name;
	}
	if (grpname == null || grpname == "") {
		return false;
	}
	self.lowNum = parseInt(CryptoJS.enc.Hex.stringify(CryptoJS.SHA3(grpname))
			.substring(0, 8), 16);
	console.log("lowNum: " + self.lowNum);

	self.ssExchange.beginExchange(self.secret);
	self.ssExchange.assignUserRequest(function(response) {
		console.log(response);
		var userID = self.ssExchange.assignUser(response);

		self.ssExchange.syncUsersRequest(self.lowNum, function(response) {
			console.log(response);
			var isData = self.ssExchange.syncUsers(response);
			self.progressDataRequest();
		});
	});

};

SafeSlingerUI.prototype.progressDataRequest = function() {
	var self = this;
	self.progressData();
};

SafeSlingerUI.prototype.progressData = function() {
	var self = this;
	if (!self.ssExchange.isDataComplete()) {
		setTimeout(function() {
			self.progressData();
		}, 1000);
	} else {
		var position = self.ssExchange.getPosition();
		var hash = self.ssExchange.getHash24Bits();
		var decoy1 = self.ssExchange.getDecoy24Bits1();
		var decoy2 = self.ssExchange.getDecoy24Bits2();

		self.showPhrases(position, hash, decoy1, decoy2);
	}
};

SafeSlingerUI.prototype.showPhrases = function(position, hash, decoy1, decoy2) {
	var self = this;
	var selected = null;
	self.container.innerHTML = "";
	var phraseDiv = document.createElement("div");

	console.log("position --> " + position);
	console.log("hash --> " + hash);
	console.log("decoy1 --> " + decoy1);
	console.log("decoy2 --> " + decoy2);

	var hashes = [];
	hashes[position - 1] = hash;
	switch (position - 1) {
	case 0:
		hashes[1] = decoy1;
		hashes[2] = decoy2;
		break;
	case 1:
		hashes[0] = decoy1;
		hashes[2] = decoy2;
		break;
	case 2:
		hashes[0] = decoy1;
		hashes[1] = decoy2;
		break;
	}

	var phrase1 = SafeSlinger.util.getWordPhrase(hashes[0]);
	var phrase2 = SafeSlinger.util.getWordPhrase(hashes[1]);
	var phrase3 = SafeSlinger.util.getWordPhrase(hashes[2]);

	// --- creating users div ---//
	var usersDiv = document.createElement("div");
	usersDiv.id = "users-div";
	usersDiv.insertAdjacentHTML("afterbegin", "Number of Users: "
			+ self.ssExchange.numUsers);
	self.container.appendChild(usersDiv);

	var phrase1Div = document.createElement("div");
	phrase1Div.id = "phrase1-div";
	var input1 = document.createElement("input");
	input1.type = "radio";
	input1.name = "phrase";
	input1.id = "first";
	input1.value = phrase1;
	var label1 = document.createElement("label");
	// label1.for = "first";
	label1.innerHTML = phrase1;

	var phrase2Div = document.createElement("div");
	phrase2Div.id = "phrase2-div";
	var input2 = document.createElement("input");
	input2.type = "radio";
	input2.name = "phrase";
	input2.id = "second";
	input2.value = phrase2;
	var label2 = document.createElement("label");
	// label2.for = "second";
	label2.innerHTML = phrase2;

	var phrase3Div = document.createElement("div");
	phrase3Div.id = "phrase3-div";
	var input3 = document.createElement("input");
	input3.type = "radio";
	input3.name = "phrase";
	input3.id = "third";
	input3.value = phrase3;
	var label3 = document.createElement("label");
	// label3.for = "third";
	label3.innerHTML = phrase3;

	var noMatch = document.createElement("input");
	noMatch.type = "submit";
	noMatch.id = "no-match";
	noMatch.value = "No Match";
	noMatch.addEventListener("click", function() {
		self.ssExchange.syncSignaturesRequest(selected, function(response) {
			console.log(response);
			var isMatch = self.ssExchange.syncSignatures(response);
			self.progressMatchRequest();
		});
	});

	var next = document.createElement("input");
	next.type = "submit";
	next.id = "next";
	next.value = "Next";
	next.addEventListener("click", function() {
		if (document.getElementById("first").checked) {
			selected = hashes[0];
		} else if (document.getElementById("second").checked) {
			selected = hashes[1];
		} else if (document.getElementById("third").checked) {
			selected = hashes[2];
		}
		self.ssExchange.syncSignaturesRequest(selected, function(response) {
			console.log(response);
			var isMatch = self.ssExchange.syncSignatures(response);
			self.progressMatchRequest();
		});
	});

	var br = document.createElement("br");
	phraseDiv.appendChild(input1);
	phraseDiv.appendChild(label1);
	phraseDiv.appendChild(phrase1Div);
	phraseDiv.appendChild(input2);
	phraseDiv.appendChild(label2);
	phraseDiv.appendChild(phrase2Div);
	phraseDiv.appendChild(input3);
	phraseDiv.appendChild(label3);
	phraseDiv.appendChild(br);
	phraseDiv.appendChild(noMatch);
	phraseDiv.appendChild(next);

	self.container.appendChild(phraseDiv);
};

SafeSlingerUI.prototype.progressMatchRequest = function() {
	var self = this;
	self.progressMatch();
};

SafeSlingerUI.prototype.progressMatch = function() {
	var self = this;
	if (!self.ssExchange.isMatchComplete()) {
		setTimeout(function() {
			self.progressMatch();
		}, 1000);
	} else {
		var dataSet = self.ssExchange.getDataSet();
		self.showResults(dataSet);
	}

	SafeSlingerUI.prototype.showResults = function(plaintextSet) {
		var self = this;
		self.container.innerHTML = "";

		// --- creating users div ---//
		var usersDiv = document.createElement("div");
		usersDiv.id = "users-div";
		usersDiv.insertAdjacentHTML("afterbegin", "Number of Users: "
				+ self.ssExchange.numUsers);
		self.container.appendChild(usersDiv);

		// --- creating phrase div ---//
		var hash = self.ssExchange.getHash24Bits();
		var phrase = SafeSlinger.util.getWordPhrase(hash);
		var phraseDiv = document.createElement("div");
		phraseDiv.id = "phrase-div";
		phraseDiv.insertAdjacentHTML("afterbegin", "Phrase: " + phrase);
		self.container.appendChild(phraseDiv);

		for (var i = 0; i < self.ssExchange.uidSet.length; i++) {
			var uid = self.ssExchange.uidSet[i];
			// if (plaintextSet[uid] != null && plaintextSet[uid] != ""){
			var results = null;
			if (uid == self.ssExchange.userID) {
				results = "My Secret: " + plaintextSet[uid];
			} else {
				results = "Their Secret: " + plaintextSet[uid];
			}
			var resultDiv = document.createElement("div");
			resultDiv.id = "plain-set";
			resultDiv.insertAdjacentHTML("afterbegin", results);
			self.container.appendChild(resultDiv);
			// }
		}
	};

};
