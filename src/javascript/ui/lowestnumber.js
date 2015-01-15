SafeSlingerUI.prototype.enterLowestNumber = function() {
	var self = this;
	self.container.innerHTML = "";
	var lowestNumDiv = document.createElement("div");
	lowestNumDiv.id = "lowest-num";

	lowestNumDiv.insertAdjacentHTML("afterbegin", "Enter the lowest number: ");

	var lowestNumInput = document.createElement("input");
	lowestNumInput.type = "text";
	lowestNumInput.id = "lowest-num-input";
	lowestNumDiv.appendChild(lowestNumInput);

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.id = 'submit-lowest-num';
	submit.addEventListener("click", function (){
		console.log(document.getElementById("lowest-num-input").value);
		self.showPhrases();
	});

	self.container.appendChild(lowestNumDiv);
	self.container.appendChild(submit);
};