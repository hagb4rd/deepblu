// https://github.com/request/request-promise/#cheat-sheet


require('es5-shim');
require('es6-shim');
require('es7-shim');
var util = require('util');
var rp = require('request-promise');
var qs = require('querystring');
var Promise = require('bluebird');
var extend = require('extend');

const GOOGLE_APIKEY=process.env['GOOGLE_APIKEY']; 


//GOOGLE FAVICON GRABBER
// --
//http://www.google.com/s2/favicons?domain=reddit.com
exports.favicon = function favicon(domain) {
  var api = "http://www.google.com/s2/favicons";
  return api+"?"+domain;
};

//GET https://www.googleapis.com/language/translate/v2?q=cunt&target=pl&key={GOOGLE_APIKEY}
exports.translate = function translate(text, lang) {
  var options = {
    method: 'GET',
    uri: 'https://www.googleapis.com/language/translate/v2"',
    json: true,
    qs: {
      q: text,
      target: lang,
      key: GOOGLE_APIKEY
    },
    headers: {},
    body: {}
  };
  return rp(options);
}







//GOOGLE SEARCH API
//=================
  /*
  template: "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&cref={cref?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&relatedSite={relatedSite?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&        rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json",
  /* */
//--
//https://www.googleapis.com/customsearch/v1?q=penny+porn&cref=https%3A%2F%2Fcse.google.com%2Fcse%2Fsetup%2Fbasic%3Fcx%3D009459769908964694922%3Anqaunjehoqs&cx=009459769908964694922%3Anqaunjehoqs&fileType=gif&imgSize=medium&safe=off&searchType=image&start=1&key={YOUR_GOOGLE_APIKEY}



//GOOGLE CONSOLE - API LIBRARY
//============================
// enalbe disable apis
// setup credentials
//--
// https://console.developers.google.com/apis/library?project=hagb4rd-intranet

//GOOGLE CONSOLE - API EXPLORER
//=============================
// test api interface
//--
// https://developers.google.com/apis-explorer/


//GOOGLE CUSTOM SEARCH ENGINE 
//===========================
// create custom search engine
// public url https://cse.google.com:443/cse/publicurl?cx=009459769908964694922:nqaunjehoqs
//--
// https://cse.google.com/cse/all

//GOOGLE CUSTOM SEARCH ENGINE PUBLIC GUI URL
var publicUrl = "https://cse.google.com:443/cse/publicurl?cx=";
//Hidden private CSE-IDs
var CSE = {
  all: process.env['google_cse_all_id'], //|| '009459769908964694922:nqaunjehoqs',
  imgsrcru: process.env['google_cse_imgsrcru_id'] //||'009459769908964694922:yb5esesqxmg'
};

//DEFAULT SEARCH ENGINE API
var defaultOptions = {
    num: 10,
    start: null,
    lr: null,
    safe: 'off',
    cx: CSE.all,
    cref: publicUrl + CSE.all,
    sort: null,
    filter: null,
    gl: null,
    cr: null,
    googlehost: null,
    c2coff: null,
    hq: null,
    hl: null,
    siteSearch: null,
    siteSearchFilter: null,
    exactTerms: null,
    excludeTerms: null,
    linkSite: null,
    orTerms: null,
    relatedSite: null,
    dateRestrict: null,
    lowRange: null,
    highRange: null,
    searchType: 'image',
    fileType: null,
    rights: null,
    imgSize: null,
    imgType: null,
    imgColorType: null,
    imgDominantColor: null,
    alt: "json" 
  }

function CustomSearch(cx) {
  var self = extend(this, defaultOptions);
  if(cx) {
    self.cx = cx
  }
};
CustomSearch.prototype = defaultOptions;

CustomSearch.prototype.search = function(text, start, num) {
  var self = this;
  //build query
  var query = {};
  //traverse all option keys, and keep only those which are not null 
  Object.keys(defaultOptions).forEach(function(k, i) {
        if((self[k] !== null) && (self[k] !== undefined))
          query[k]=self[k];
  });
  //parameter
  query['q'] = text;
  if(start !== undefined)
    query['start'] = start;
  if(num !== undefined)
    query['num'] = num;
  query['key'] = GOOGLE_APIKEY;
  
  //Querystring Log
  ///console.log(util.inspect(query, {showHidden: true, depth: null, colors: true}));
   
  var options = {
   // method: 'GET',
    uri: 'https://www.googleapis.com/customsearch/v1',
    json: true,
    qs: query,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    simple:false
  };
  console.log('HTTP REQUEST:\r\n');
  console.log(options.uri + '?' + qs.stringify(query));
  console.log('\r\n');
  
  
  return rp(options);
  /*
  rp(options).then(function(result) {
    //console.log(util.inspect(result,{showHidden: true, depth:null, color: true}));
    Promise.resolve(result);
  }).catch(function(err) {
    console.log(util.inspect(err,{showHidden: true, depth:null, color: true}));
    Promise.reject(err);
    //throw(err);
  });
  */
};

//Create Animated GIF Search
var gif = new CustomSearch();
gif.fileType = 'gif';
gif.searchType = 'image';
exports.gif = gif;


exports.CustomSearch = CustomSearch;

//Catch uncaught errors
process.on('uncaught', function(e) {
    console.log(util.inspect(e,{showHidden: true, depth:null, color: true}));
});
