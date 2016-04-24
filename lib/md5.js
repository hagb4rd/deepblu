'use strict'

var crypto = require('crypto')
var fs = require('fs')

exports.file = function(filename) {
	return exports.fromStream(fs.createReadStream(filename));
}

exports.stream = function (stream) {
  var sum = crypto.createHash('md5');
	var data = "";
	var buffer = new Uint32Array();
	return new Promise(function(resolve, reject) {
		stream.on('error', function (err) {
			Promise.reject(err);
		})
		stream.on('data', function (chunk) {
			try {
				sum.update(chunk);
				data += chunk;
				buffer = buffer.concat(new Uint32Array(chunk));
			} catch (ex) {
				Promise.reject(ex);
			}
		})
		stream.on('end', function () {
			Promise.resolve({md5:sum.digest('hex'), data: data, buffer: buffer});
		})
	});

}

exports.fileAsync = function(filename) {
	var sum = crypto.createHash('md5');
	var data = fs.readFileSync(filename);
	var buffer = new Uint32Array(data);
	sum.update(data);
	return {md5:sum.digest('hex'), data: data, buffer: buffer})
}
