
var access_token = "b009623ac0eb2582a268cc6e552844f5f0a20772"; //process.env[];
var client_secret = process.env["bitly_client_secret"];
var client_id = process.env["bitly_client_id"];
var username = process.env["bitly_username"];
var pass = process.env["bitly_pass"];


var BitlyAPI = require("node-bitlyapi");
var Bitly = new BitlyAPI({
	client_id: client_id,
	client_secret: client_secret
});



//You can then either authenticate using your username and password

Bitly.authenticate(username, pass, function(err, access_token) {
	// Returns an error if there was one, or an access_token if there wasn't
	//or if you know your OAuth access_token, you can simply call:
	Bitly.setAccessToken(access_token);
});



//The Bitly Object
/*
	Each of the public Bitly API endpoints are mapped and available with the following method signature
	Bitly.test = function(url)
	{
	Bitly.[method name](parameters, callback(error, response) { console.log(util.inspect(response, false, true, true); });
}


	});
/* */

//For Example:
Bitly.short = function(url) {
	url = url||"https://github.com/nkirby/node-bitlyapi";
	Bitly.shorten({longUrl:url}, function(err, results) { console.log(util.inspect(results, false, 6, true)); });
}
//Bitly.shorten({longUrl:"https://github.com/nkirby/node-bitlyapi"}, function(err, results) {
	// Do something with your new, shorter url...
//});

// Gets the public link history of "login"
//Bitly.user('login').getLinkHistory(null, function(err, results) { });

//For more information about a BitlyUser - Wiki
//BitlyLink

/*
//Get Link Info
Bitly.link('http://bit.ly/1eOHYrA').getInfo(function(err, results) { });
/* */

module.exports = Bitly;
