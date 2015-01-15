SafeSlingerUI.prototype.showPhrases = function() {
	var self = this;
	self.container.innerHTML = "";
	var phraseDiv = document.createElement("div");
	var input1 = document.createElement("input");
	input1.type = "radio";
	input1.name = "phrase";
	input1.id = "first";
	input1.value = "Cat Dog Mad";
	var label1 = document.createElement("label");
	label1.for = "first";
	label1.innerHTML = "Cat Dog Mad";


	var input2 = document.createElement("input");
	input2.type = "radio";
	input2.name = "phrase";
	input2.id = "second";
	input2.value = "Go Goa Gone";
	var label2 = document.createElement("label");
	label2.for = "second";
	label2.innerHTML = "Go Goa Gone";

	var input3 = document.createElement("input");
	input3.type = "radio";
	input3.name = "phrase";
	input3.id = "third";
	input3.value = "Hi Hello Bye";
	var label3 = document.createElement("label");
	label3.for = "third";
	label3.innerHTML = "Hi Hello Bye";

	var noMatch = document.createElement("input");
	noMatch.type = "submit";
	noMatch.id = "no-match";
	noMatch.value = "No Match";

	var next = document.createElement("input");
	next.type = "submit";
	next.id = "nexy";
	next.value = "Next";

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