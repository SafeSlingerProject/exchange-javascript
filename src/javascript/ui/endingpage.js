SafeSlingerUI.prototype.showResults = function(plaintextSet) {
	var self = this;
	self.container.innerHTML = "";
	var resultDiv = document.createElement("div");
	resultDiv.id = "plain-set";

	resultDiv.insertAdjacentHTML("afterbegin", "Result: " + plaintextSet);

	self.container.appendChild(resultDiv);
};

SafeSlingerUI.prototype.showError = function(msg) {
	var self = this;
	self.container.innerHTML = "";
	var resultDiv = document.createElement("div");
	resultDiv.id = "error";

	resultDiv.insertAdjacentHTML("afterbegin", "Error: " + msg);

	self.container.appendChild(resultDiv);
};