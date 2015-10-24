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
	hashes[position-1] = hash;
	switch (position-1) {
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
	
	var phrase1 = SafeSlinger.util.getNumberPhrase(hashes[0]);
	var phrase2 = SafeSlinger.util.getNumberPhrase(hashes[1]);
	var phrase3 = SafeSlinger.util.getNumberPhrase(hashes[2]);
		
	var input1 = document.createElement("input");
	input1.type = "radio";
	input1.name = "phrase";
	input1.id = "first";
	input1.value = phrase1;
	var label1 = document.createElement("label");
	label1.for = "first";
	label1.innerHTML = phrase1;

	var input2 = document.createElement("input");
	input2.type = "radio";
	input2.name = "phrase";
	input2.id = "second";
	input2.value = phrase2;
	var label2 = document.createElement("label");
	label2.for = "second";
	label2.innerHTML = phrase2;

	var input3 = document.createElement("input");
	input3.type = "radio";
	input3.name = "phrase";
	input3.id = "third";
	input3.value = phrase3;
	var label3 = document.createElement("label");
	label3.for = "third";
	label3.innerHTML = phrase3;

	var noMatch = document.createElement("input");
	noMatch.type = "submit";
	noMatch.id = "no-match";
	noMatch.value = "No Match";
	noMatch.addEventListener("click", function (){
		self.ssExchange.syncSignaturesRequest(selected, function (response) {
			console.log(response);
			var isMatch = self.ssExchange.syncSignatures(response);
			self.progressMatchRequest();
		});
	});

	var next = document.createElement("input");
	next.type = "submit";
	next.id = "next";
	next.value = "Next";
	next.addEventListener("click", function (){
		if (document.getElementById("first").checked) {
			selected = hashes[0];
		} else if (document.getElementById("second").checked) {
			selected = hashes[1];			
		} else if (document.getElementById("third").checked) {
			selected = hashes[2];			
		}
		self.ssExchange.syncSignaturesRequest(selected, function (response) {
			console.log(response);
			var isMatch = self.ssExchange.syncSignatures(response);
			self.progressMatchRequest();
		});
	});
	
	var br = document.createElement("br");
	phraseDiv.appendChild(input1);
	phraseDiv.appendChild(label1);
	phraseDiv.appendChild(input2);
	phraseDiv.appendChild(label2);
	phraseDiv.appendChild(input3);
	phraseDiv.appendChild(label3);
	phraseDiv.appendChild(br);
	phraseDiv.appendChild(noMatch);
	phraseDiv.appendChild(next);

	self.container.appendChild(phraseDiv);
};

SafeSlingerUI.prototype.progressMatchRequest = function (){
	var self = this;
	self.progressMatch(); 					
}

SafeSlingerUI.prototype.progressMatch = function (){
	var self = this;
	if(!self.ssExchange.isMatchComplete()){
		setTimeout(function() { 
			self.progressMatch(); 					
		}, 1000);
	}else{
		var dataSet = self.ssExchange.getDataSet();	
		self.showResults(dataSet);
	}
}
