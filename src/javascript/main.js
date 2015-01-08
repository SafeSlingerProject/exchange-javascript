var My = function(){
	var con = new SafeSlinger.HTTPSConnection("https://slinger-dev.appspot.com","abcd");
	con.doPost("/assignUser");
}();