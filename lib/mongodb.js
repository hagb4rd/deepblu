
var es5 = require('es5-shim');
var es6 = require('es6-shim');
var es7 = require('es6-shim');
var util = require('util');
var Promise = require('bluebird')
var promisify = require('./promisify.js');
var writer = require('./logwriter.js');


var MongoClient = require('mongodb').MongoClient;
//hewsfsf




var Db = function Db(connectionString) {
	this.connectionString = connectionString || 'mongodb://127.0.0.1:27017/test';
}

Db.prototype.connect = function(connectionString) {
    return new Promise(function(resolve, reject) {
        connectionString = connectionString || this.connectionString;
        MongoClient.connect(connectionString, function(err, db) {
            if(err) {
                console.log(writer(err));
                reject(err);
            } else {
                console.log(writer(db, 'DbGallery Connted', false, 1));
                resolve(db);
            }
        });
    });
}

Db.prototype.collection = function(collectionName) {
  return new Promise(function(resolve, reject) {
    this.connect().then(function(db) {
        var collection = db.collection(collectionName);
        resolve(collection);
    })
  })
}

var dbGallery = new Db('mongodb://127.0.0.1:27017/test');

const COLLECTIONS = {
		images: {
				title: 'imgur_images',
				index: [{id: 1}, { name: 'text', title: 'text', description: 'text', comment_preview: 'text', tags: 'text'}]
		},
		albums: {
		 title: 'imgur_albums',
		 index: [{id: 1}]
		}
};

dbGallery.albums = function() {
	return dbGallery.collection('imgur_albums');
}

dbGallery.images = function() {
	return dbGallery.collection('imgur_images');
}

dbGallery.updateAlbums = function(albums) {
    return new Promise(function(resolve, reject) {
      this.albums().then(function(oldalbums) {
              oldalbums.drop(function(err, docs) {
                if(!err) {
                    this.albums().then(function(newalbums) {
                        newalbums.createIndex({id: 1}, {unique: true});
                        newalbums.insert(albums, function(err, docs) {
													if(!err) {
														console.log(writer(docs));
														console.log('dbGallery.updateAlbums.. complete.\n');
                            resolve(docs);
													} else {
														reject(err);
													}
                        });
                    });
                } else {
                    reject(err);
                }
            })
        });
    });
}

dbGallery.insertImages = function(images) {
    return new Promise(function(resolve, reject) {

            this.images().then(function(imagesDb){
							imagesDb.insert(images, function(err, docs) {
	                if(err) {
	                    console.log(writer(err, "ERROR dbGallery.insertImages"));
	                    reject(err);
	                };
	                //db.close();
	                console.log(writer(docs, "db.images.insertMany result"));
	                resolve(docs);
	            });
						})
        });
    });
}


dbGallery.ensureCollections = function() {
    this.images().then(function(imagesDb) {
            imagesDb.ensureIndex({id: 1}, function() {
                imagesDb.ensureIndex({ name: 'text', title: 'text', description: 'text', comment_preview: 'text', tags: 'text'} , function () {
                    return Promise.resolve(imagesDb);
                });
            });
    });
}

module.exports.dbGallery = dbGallery;
