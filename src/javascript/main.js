var My = (function(){
	var container = document.getElementsByClassName("containerDiv");
	var ui = new SafeSlingerUI(container[0]);
	ui.showServerSecretView();
})();