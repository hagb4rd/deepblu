var dirtydb = require('dirty');
var util = require('util');
var fs = require('fs');
var lib = require('./lib');


function Storage(name, file) {
    this.name = name || lib.GUID();
    this.file = file || this.name + ".db";
    this.repository = new dirtydb(this.file);
    
    Object.defineProperty(this, 'keys', { 
      get: function() {
        return this.repository._keys;
      }
    });

    
    Object.defineProperty(this, 'length', { 
      get: function() {
        return this.repository._keys.length;
      }
    });
        
}



Storage.prototype.getItem = function getItem(key) {
  return this.repository.get(key);
}

Storage.prototype.setItem = function setItem(key, data) {
  return this.repository.set(key, data);
}

Storage.prototype.key = function key(index) {
  return this.keys[index];
  
}

Storage.prototype.clear = function clear() {
  
}

Storage.prototype.removeItem = function removeItem(key) {
  this.repository.rm(key);
}

/*
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');
var check;
db.serialize(function() {

  db.run("CREATE TABLE if not exists user_info (info TEXT)");
  var stmt = db.prepare("INSERT INTO user_info VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM user_info", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

db.close();
/* */