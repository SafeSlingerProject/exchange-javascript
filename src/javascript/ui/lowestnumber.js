SafeSlingerUI.prototype.enterLowestNumber = function(userID) {
	var self = this;
	self.container.innerHTML = "";
	var lowestNumDiv = document.createElement("div");
	lowestNumDiv.id = "lowest-num";

	lowestNumDiv.insertAdjacentHTML("afterbegin", "Enter the lowest number: ");
	lowestNumDiv.insertAdjacentHTML("afterbegin", "Assigned Id: " + userID);

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
		self.ssExchange.selectLowestNumberRequest(self.lowNum, function (response) {
			console.log(response);
			var isData = self.ssExchange.selectLowestNumber(response);
		});
		//self.showPhrases();
	});

	self.container.appendChild(lowestNumDiv);
	self.container.appendChild(submit);
};