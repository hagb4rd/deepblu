var es5 = require('es5-shim');
var es6 = require('es6-shim');
var es7 = require('es7-shim');
var util = require('util');
var Promise = require("bluebird");

module.exports = function promisify(target, multi, functions) {
		var filter;
		if(Array.isArray(functions)) {
			filter = function(name) {
				return functions.includes(name);
			}
		}
	
    return Promise.promisifyAll(target, {
		suffix: "Async",
		filter: function(name) {
			if(Array.isArray(functions)) {
				return functions.includes(name);
			} else {
				return false;
			}

		},
		multiArgs: (multi || false)
	});
};
