
var USER_AGENT = "nodejs/0.0.1 (node) gist command line tool v0.0.1",
    request = require("request"),
    //rp = require('request-promise'),
    qs = require('querystring'),
    URL = require('url'),
    util = require('util');
    
    
    
/**
 * Gist Paste
 * 
 * @param text Text to paste.
 * @param description Description
 * @param title gistfile-title 
 * @param public defaults to false
 * @param template 'Hello Mr. $$name$$.' Placeholders Will be rendered with the render method and a dictionary of key value pairs
 */

function GistFile(text, title, description, template) {
  if(!text) {
    throw new TypeError('GistFile Constructor: Missing Parameter');
  } else {
    this.text=text;    
  }
  if(description)
    this.description=description;
  if(title)
    this.title=title;
  if(template)
    this.template=template;
}
GistFile.prototype.description = Date.now().toString();
GistFile.prototype.title = Date.now() + ".md"; 
GistFile.prototype.public = false;
GistFile.prototype.template = "# $$tittle$$\r\njs```\r\n$$text$$\r\n```";
GistFile.prototype.toString = function(dictionary) {
  var self = this;
  var output = this.template;
  Object.keys(GistFile.prototype).forEach(function(key,i) {
    output = output.replace('$$'+key+'$$', self[key]); 
  });
  if(dictionary) {
    Object.keys(dictionary).forEach(function(key,i) {
      output = output.replace('$$'+key+'$$', dictionary[key]); 
    })
  };
  return output;
}; 



function render(template, dictionary) {
  var output = this.template;
  Object.keys(GistFile.prototype).forEach(function(key,i) {
    output = output.replace('$$'+key+'$$', self[key]); 
  });
  if(dictionary) {
    Object.keys(dictionary).forEach(function(key,i) {
      output = output.replace('$$'+key+'$$', dictionary[key]); 
    })
  };
  return output;
}


/**
 * Pastes GistFiles to GISTHUB
 * 
 * @param {[GistFile]} Array of GistFiles
 * @returns {string} Gist URL
 */
function gistpaste(text, title, description, public) {
  
  return new Promise(function(resolve, reject) {
    if(text.length < 1)
      reject(Error("textlength must be > 0"));
      
      var gistFile = new GistFile(text, title, description);
      

    var payload = {
      description: gistFile.description,
      public: public || false,
      files: { }
    };
           
    payload.files[gistFile.title] = {content: gistFile.render()};
    description = gistFile.description;

    //done(null, { payload: payload });

    var opt = {
        method: 'POST',
        url: "https://api.github.com/gists",
        headers: {"User-Agent": "nodejs/0.0.1 (node) gist command line tool v0.0.1" },
        json: payload
    };

    rp(opt).then(function(response) {
      var blocks_url = '';
      var url = URL.parse(response.body.html_url)
      var result = URL.format(url);
      resolve(result);
    });
  });
};
// filenames is an array, options is an object of command line options.
function gist(text, name, description) {
  return new Promise(function(resolve, reject) {
    if(text.length < 1)
      throw new Error("textlength must be > 0");

    name = name || (new Date()).toString();
    description = description || "output";

    var payload = {
      description: description,
      public: false,
      files: { }
    }
    payload.files[name + ".md"] = {content: "```js\r\n" + text + "\r\n```" };

    //done(null, { payload: payload });

    var opt = {
        url: "https://api.github.com/gists",
        headers: {"User-Agent": "nodejs/0.0.1 (node) gist command line tool v0.0.1" },
        json: payload
    };

    request.post(opt, function(err, response) {
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

module.exports = gist;
