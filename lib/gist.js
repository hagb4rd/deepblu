
var USER_AGENT = "nodejs/0.0.1 (node) gist command line tool v0.0.1"
  , request = require("request")
  , qs = require('querystring')
  , URL = require('url')
  , util = require('util');
  //, es5shim = require('es5-shim')
  //, es6shim = require('es6-shim');


// filenames is an array, options is an object of command line options.
function gist (text, name, description) {
  return new Promise(function(resolve, reject) {
    if(text.length < 1)
      throw new Error("textlength must be > 0");

    name = name || new Date().toString();
    description = description || "output";

    var payload = {
      description: description,
      public: false,
      files: { }
    }
    payload.files[name] = {content: text};

    //done(null, { payload: payload });

    var r = {
        url: "https://api.github.com/gists"
      , headers: {"User-Agent": "nodejs/0.0.1 (node) gist command line tool v0.0.1" }
      , json: payload
    };

    request.post(r, function(err, response) {
      if(err)
        reject(err);
      var blocks_url = '';

      var url = URL.parse(response.body.html_url)

      /*
      if(data.options.blocks) {
        url = {
            hostname: 'bl.ocks.org'
          , pathname: url.pathname
          , protocol: url.protocol
        }
      }

      if(data.options.requirebin) {
        url = {
            hostname: 'requirebin.com'
          , protocol: 'http'
          , query: {gist: url.pathname}
        }
      }
      */
      var result = URL.format(url);
      resolve(result);
    });
  });

}

process.on('uncaughtException', function (err) { console.log('\nUNCAUGHT EXCEPTION:\n' + util.inspect(err) + "\n\n"); });

module.exports = gist
