SafeSlingerUI.prototype.showResults = function(plaintextSet) {
	var self = this;
	self.container.innerHTML = "";
	var resultDiv = document.createElement("div");
	resultDiv.id = "plain-set";

	resultDiv.insertAdjacentHTML("afterbegin", "Result: " + JSON.stringify(plaintextSet));

	self.container.appendChild(resultDiv);
};
