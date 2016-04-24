var process = require('process');

process.on('uncaught', function(e) {
	console.log(e.stack);
})

var es5 = require('es5-shim');
var es6 = require('es6-shim');
var es7 = require('es7-shim');

var util = require('util');
//log function
var Writer = module.exports = function(depth, hidden, colors) {
	this.depth = depth||0;
	this.hidden = hidden||true;
	this.colors = colors||true;
	this.write = function(obj,depth,label,hidden,colors) {
		var line = '----', border = "=", s, log;

		depth = depth || this.depth;
		colors = colors || this.colors;
		hidden = hidden || this.hidden;
		label = label || "[ " + obj.toString() + " ]";

		s = line + " " + obj + " " + line;
		border = line[0].repeat(s.length);
		log = "\n";
		//*
		if(typeof(obj) != 'string')
			log += s + "\n";
		/* */
		log = util.inspect(obj, hidden, depth, colors) + "\r\n";
		//log += border + "\n";

		return log;
	}
}
