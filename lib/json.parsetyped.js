// https://tonicdev.com/kasiawygodna/json.parsetyped
// author: earendel
// date: 2016-03-18
// mailto: kasia99@gmx.de

require('es6-shim');

/*
interface JSON.Serializable
{
    (String) toJSON: [Function],
    (Object) fromJSON: [Function]
}
/* */


//toJSON() and fromJSON() are functions to be implement by contract of the interface
Buffer.prototype.fromJSON = function(json) {
	return new Buffer(json);
}

//As initially intended JSON.parseTyped investigates Function.prototypes looking for a .fromJSON() method (as a pendant to the .toJSON() method) to invoke upon the data field and construct/deserialize a JS Object. Now who's your daddy? *whipcrack*
JSON.parseTyped = function parseTyped(json) {
	return JSON.parse(json, (k,v) => {
    var type = v.type;
    var data = v.data;
		if((type !== undefined) && (data !== undefined)) {
            var construct = global[type];
			if(construct !== undefined) {
                var proto = construct.prototype;
				if(proto !== undefined) {
                    var fromJSON = proto.fromJSON;
					if(fromJSON !== undefined) {
						return fromJSON(data);
					}
				}
			}
		}
		return v;
	});
};

module.exports = JSON.parseTyped;
/*
var buff = new Buffer('hello world');
var json = JSON.stringify(buff);
console.log(json);
JSON.parseTyped(json);
/* */
