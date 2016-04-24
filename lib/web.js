var suggest = "http://suggestqueries.google.com/complete/search?json&client=firefox&hl=en&q=%q";


var es5shim = require('es5-shim');
var es6shim = require('es6-shim');
var es7shim = require('es7-shim');
var fs = require('fs');
var util = require('util');
var qs = require('querystring');
var vm = require('vm');
var net = require('net');
var http = require("http");
var url = require("url");
var request = require('request');
var Promise = require('bluebird');





var web = {
	defaultOptions: {
		'host': 'ajax.googleapis.com',
		'path': "/ajax/services/search/web?v=1.0&q=" + encodeURIComponent(query),
		'method': 'get',
		'port': 80,
		'Referer': 'http://www.v8bot.com',
		'User-Agent': 'NodeJS HTTP client',
		'Accept': '*/*'
	};
};



/*

var googlesearch = exports.googlesearch = function(query) {
  return new Promise(function(resolve, reject) {
    var options = {
      'host': 'ajax.googleapis.com',
      'path': "/ajax/services/search/web?v=1.0&q=" + encodeURIComponent(query),
      'method': 'get',
      'port': 80,
      'Referer': 'http://www.v8bot.com',
      'User-Agent': 'NodeJS HTTP client',
      'Accept': '*/*'
    };
    var request = http.request(options, (res) => {
      res.setEncoding('utf8');
      var body = "";

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {

        var searchResults = JSON.parse(body);
        if (searchResults.responseData.results) {

          var results = searchResults.responseData.results.map(result => {
						return {
	            url: decodeURIComponent(result.url),
	            title: result.titleNoFormatting.replace(/&#(\d+);/g, (a, b) => String.fromCharCode(b)),
	            content: result.content
          	}
					});
          resolve(results);
        } else {
          reject('No results found.')
        }
      })
    }).end();
  })
};

var google = exports.google = function(query) {
	return new Promise(function(resolve, reject) {
		googlesearch(query).then(results => {
			var formatted =  results.map(result => result.title + " | " + result.url + " | " + result.content.replace(/\r\n/gi, //).replace(/<[^>]*>/gi, ""));
			resolve(formatted);
		})
	});
};


var lucky = exports.lucky = function(query) {
	return new Promise(function(resolve, reject) {
			google(query).then(results => {
				resolve(results[0]);
			})
	})
	/*
	.then(result => {
		console.log(result);
	})
	/* */
}
