SafeSlingerUI.prototype.showGroupingNumber = function(userID) {
	var self = this;
	self.container.innerHTML = "";
	var lowestNumDiv = document.createElement("div");
	lowestNumDiv.id = "lowest-num";

	lowestNumDiv.insertAdjacentHTML("afterbegin", "Enter the lowest number: ");
	lowestNumDiv.insertAdjacentHTML("afterbegin", "Assigned Id: " + userID + " ");

	var lowestNumInput = document.createElement("input");
	lowestNumInput.type = "text";
	lowestNumInput.id = "lowest-num-input";
	lowestNumDiv.appendChild(lowestNumInput);

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.id = 'submit-lowest-num';
	submit.addEventListener("click", function (){
		self.lowNum = document.getElementById("lowest-num-input").value;
		console.log(self.lowNum);
		self.ssExchange.syncUsersRequest(self.lowNum, function (response) {
			console.log(response);
			var isData = self.ssExchange.syncUsers(response);
			self.progressDataRequest();
		});
	});

	self.container.appendChild(lowestNumDiv);
	self.container.appendChild(submit);
};

SafeSlingerUI.prototype.progressDataRequest = function (){
	var self = this;
	self.progressData(); 					
};

SafeSlingerUI.prototype.progressData = function (){
	var self = this;
	if(!self.ssExchange.isDataComplete()){
		setTimeout(function() { 
			self.progressData(); 					
		}, 1000);
	}else{
		var position = self.ssExchange.getPosition();	
		var hash = self.ssExchange.getHash24Bits();
		var decoy1 = self.ssExchange.getDecoy24Bits1();
		var decoy2 = self.ssExchange.getDecoy24Bits2();	
		self.showPhrases(position, hash, decoy1, decoy2);
	}
};