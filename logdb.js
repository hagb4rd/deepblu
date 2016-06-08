require('es5-shim');
require('es6-shim');
var Promise = require('bluebird');
var util = require('util');
var promisify = require('promisify-node');
var MongoClient = require('mongodb').MongoClient;
var gist = require("./lib/gist");


const LOGDB_CONNECTION_STRING = process.env['DEEPBLU_IRC_LOGDB'] || 'mongodb://127.0.0.1:27017/test';


var Log = function Log(connectionString, collectionName, ensureIndex) {

  //state
  this.connection = null;
  this.db = null;

  if (!connectionString)
    throw new TypeError('LogDb: missing parameter: new Log(connectionString, collectionName);');
  if (!collectionName)
    throw new TypeError('LogDb: missing parameter: new Log(connectionString, collectionName);');

  this.connectionString = connectionString;
  this.collectionName = collectionName;

  if (ensureIndex && (typeof(ensurdIndex) == 'function')) {
    this.ensureIndex = ensureIndex;
  }

  this.collection().then(collection => {
    console.log(collection);
    console.log("\r\n", "-------------------------------------------------------------------------------------", "\r\n");
    console.log('LogDb: ' + connectionString + ' / ' + collectionName + '  connection successful!');
  });
}

Log.prototype.ensureIndex = function(collection) {
  return new Promise((resolve, reject) => {
    collection.ensureIndex({
      text: "text",
      user: "text"
    }, function(err, docs) {
      resolve(collection);
    });
  });
};



//Log.prototype.connection = null;

Log.prototype.connect = function(connectionString) {
  self=this;
  connectionString = connectionString || this.connectionString
  return new Promise(function(resolve, reject) {
    if (self.connection) {
      resolve(self.connection);
    } else {
      MongoClient.connect(self.connectionString, function(err, conn) {
        if (err) {
          reject(err);
        } else {
          self.connection = conn;
          resolve(self.connection);
        }
      });
    }
  });
};
Log.prototype.collection = function() {
  self=this;
  return new Promise(function(resolve, reject) {
    if (self.db) {
      resolve(self.db)
    } else {
      self.connect().then(connection => {
        var collection = connection.collection(self.collectionName);
        self.ensureIndex(collection).then(ensured => {
          self.db = ensured;
          resolve(self.db);
        })
      })
    };
  });
};


Log.prototype.limit = 10000;

Log.prototype.ignoreChannel = 'jslave';

Log.prototype.from = function(_date, _channel, _limit) {
  _date = _date || (new Date(Date.now() - this.from.defaultTimeFromNow));
  if (typeof(_date) != "object") {
    _date = new Date(Date.parse(_date));
  }
  _channel = _channel || "##javascript";
  return this.search({
    $and: [{
      channel: {
        $eq: _channel
      }
    }, {
      date: {
        $gte: _date
      }
    }]
  }, null, _limit);
};
Log.prototype.from.defaultTimeFromNow = 24 * 60 * 60 * 1000;

/*
Log.prototype.gist = function(err, docs) {
  return new Promise((resolve, reject) => {
    if (err)
      reject(err);
    gist(Log.format(docs)).then(link => {
      resolve([link, docs, formatted]);
    })
  });
};
/* */
Log.prototype.search = function(_q, _channel, _date, _limit, _s) {
  self=this;
  return new Promise(function(resolve, reject) {
    var q = _q || {};
    if (typeof(q) == "string") {
      qArray = q.split(" ");
      query = [];
      qArray.forEach(function(val, key) {
        if (!val.startsWith("-")) {
          val = "\"" + val + "\"";
        }
        query.push(val);
      });
      q = query.join(" ");

      if (_date) {
        if (_date instanceof Date) {

        } else {
          _date = new Date(Date.parse(_date));
        }
        if (!(_date instanceof Date))
          throw Error("Second argument must be a valid date.");

        q = {
          $and: [{
            $text: {
              $search: q
            }
          }, {
            'channel': {
              $ne: self.ignoreChannel
            }
          }, {
            date: {
              $gte: _date
            }
          }]
        };
      } else {
        q = {
          $and: [{
            $text: {
              $search: q
            }
          }, {
            'channel': {
              $eq: _channel
            }
          }]
        };
      }

    }


    self.collection().then(collection => {
      var cursor = collection.find(q);
      var s = _s || {
        date: -1
      };
      if (s)
        cursor = cursor.sort(s);
      _limit = _limit || self.limit;
      if (_limit)
        cursor = cursor.limit(_limit);
      if(!_s) {
        cursor = cursor.sort({date: 1});
      }
      var query = (cursor => {
        cursor.toArray().then(docs => {
          if(docs.length > 0) {
            var formatted = Log.format(docs);
            gist(formatted).then(link => {
              var msg = "Rows selected: " + docs.length + " | preview: " + link;
              resolve(msg);
            })
          } else {
            var msg = "Rows selected: 0 - No matching logs found.";
            resolve(msg);
          }
        });
      });
      query(cursor);
    });
  });
};

Log.format = function (_rows) {
			var rows = _rows || [];
			var text = "";
			rows.forEach(function (row, index) {
				var d = new Date(row.date);
				//var d = row.date;
				text += d.toISOString().substr(0, 16).replace("T", "  [ ") + " ] " + row.channel + " <" + row.user + ">  " + row.text + "\n";
			});
			return text;
		};

Log.Factory = {
  "irc.german-elite.net": function() {
    return new Log(LOGDB_CONNECTION_STRING, 'logs_' + 'irc.german-elite.net');
  },
  "irc.freenode.net": function() {
    return new Log(LOGDB_CONNECTION_STRING, 'logs_' + 'irc.freenode.net');
  },
}

module.exports = Log;