SafeSlingerUI.prototype.showGetNumView = function() {
	var self = this;
	self.container.innerHTML = "";
	var numberDiv = document.createElement("div");
	numberDiv.id = "number-div";
	numberDiv.insertAdjacentHTML("afterbegin", "Select Number of users: ");
	var select = document.createElement("select");
	select.id = "num-users";
	var maxUsers = 10;
	for(var i=2; i<=maxUsers; i++){
		var option = document.createElement("option");
		option.value = i;
		option.innerHTML = i;
		select.appendChild(option);
	}
	numberDiv.appendChild(select);

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.id = 'submit-users';
	submit.addEventListener("click", function (){
		var ssExchange = new SafeSlinger.SafeSlingerExchange("https://01060000t-dot-slinger-dev.appspot.com");
		self.ssExchange = ssExchange;
		self.ssExchange.numUsers = document.getElementById("num-users").value;
		self.ssExchange.beginExchange(self.secret);
		self.ssExchange.assignUserRequest(function (response){
			console.log(response);
			var userID = self.ssExchange.assignUser(response);
			self.showGroupingNumber(userID);
		});
	});
	self.container.appendChild(numberDiv);
	self.container.appendChild(submit);
};