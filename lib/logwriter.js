require('es5-shim');
require('es6-shim');
require('es7-shim');

var util = require('util');
var Promise = require('bluebird');

var c = {};

//log function
c.logn = function(depth, hidden, colors) {
	depth = depth||1;
	hidden = hidden||false;
	colors = colors||false;
	return function(obj) {
		return util.inspect(obj,{showHidden:hidden, depth: depth, colors: colors})
		//var args = [].slice.call(arguments); 
		//return args.map(next=>util.inspect(next,{showHidden:hidden, depth: depth, colors: colors})).join('\r\n');
	}
};
c.log0 = c.logn(0);
c.log1 = c.logn(1);
c.log2 = c.logn(2);
c.log3 = c.logn(3);

module.exports = c;
/*
exports.Writer = function log(depth, hidden, colors) {
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
	
		log = util.inspect(obj, hidden, depth, colors) + "\r\n";
		//log += border + "\n";

		return log;
	}
*/
process.on('uncaught', function(e) {
	console.log(e.stack);
})
