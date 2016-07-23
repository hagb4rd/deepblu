require('es5-shim');
require('es6-shim');
var util = require('util');
var beautify = require('js-beautify').js_beautify;
//log to terminal using util.inspect
var stripAnsi = require('strip-ansi');                


str = {};
str.stripAnsi = stripAnsi;

str.format = function format(str, arr) {
    var i = -1;
    function callback(exp, p0, p1, p2, p3, p4) {
        if (exp=='%%') return '%';
        if (arr[++i]===undefined) return undefined;
        var exp  = p2 ? parseInt(p2.substr(1)) : undefined;
        var base = p3 ? parseInt(p3.substr(1)) : undefined;
        var val;
        switch (p4) {
            case 's': val = arr[i]; break;
            case 'c': val = arr[i][0]; break;
            case 'f': val = parseFloat(arr[i]).toFixed(exp); break;
            case 'p': val = parseFloat(arr[i]).toPrecision(exp); break;
            case 'e': val = parseFloat(arr[i]).toExponential(exp); break;
            case 'x': val = parseInt(arr[i]).toString(base?base:16); break;
            case 'd': val = parseFloat(parseInt(arr[i], base?base:10).toPrecision(exp)).toFixed(0); break;
        }
        val = typeof(val)=='object' ? JSON.stringify(val) : val.toString(base);
        var sz = parseInt(p1); /* padding size */
        var ch = p1 && p1[0]=='0' ? '0' : ' '; /* isnull? */
        while (val.length<sz) val = p0 !== undefined ? val+ch : ch+val; /* isminus? */
       return val;
    }
    var regex = /%(-)?(0?[0-9]+)?([.][0-9]+)?([#][0-9]+)?([scfpexd])/g;
    return str.replace(regex, callback);
};
str.format.help = "str.format() | http://draft.sx/2418072c1851fe5b271a2646b4f1f1e9";

String.prototype.format = function format() {
    return str.format(this, Array.prototype.slice.call(arguments));
}

str.repeat = function repeat(_count) {
    var _str = this;
    if (_str === undefined)
        throw ({
            name: "MissingArgumentException",
            message: "usage: request(str, [count])"
        });
    var _count = _count || 1;
    var count = Math.abs(parseInt(_count));
    var text = "";
    for (var i = count; i-- > 0;)
        text += _str;
    return text;
}

//Split a string into an array of chunks with a defined max. size
str.chunkify = function chunkify(str, size) {
    //A string to create chunks from
    str = str.toString();
    //Max. size of a chunk in characters
    size = parseInt(size);
    return str.match(RegExp(".{1," + size + "}", "gm"));
}
String.prototype.chunkify = function chunkify(size) {
    return str.chunkify(this, size);
}


str.rot13 = function rot13(s) {
    return s.replace(/[a-zA-Z]/g, function (c) {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
};

//*
String.prototype.rot13 = function rot13() {
    return str.rot13(this);
};
/* */
JSON.beautify = function (obj) {
    var result = "";
    var args = arguments;
    Object.keys(arguments).forEach(function (nextKey, nextIndex) {
        var next = args[nextKey];

        if (typeof (next) !== 'string')
            next = str.dump(next);

        next = beautify(next);

        if ((next.length > 0) && (result.length > 0))
            result += "\n";
        result += next;

    });
    return result;
}


str.shuffle = function () {
    var shuffled = [];
};

str.obj = function(o) {
    var s = "";
   
    var objects = [];
    var functions = [];

                    
                
    Object.getOwnPropertyNames(o).sort().forEach(function (prop, index) {
        if (typeof (o[prop]) === 'function') {
            functions.push(prop + '()');
        } else if (Array.isArray(o[prop])) {
            objects.push(prop + "[]");
        } else {
            objects.push(prop);
        }
    });
    
    if (objects.length > 0) {
        s += objects.join(", ");
    }
    if ((objects.length > 0) && (functions.length > 0))
        s += ", ";
    if (functions.length > 0)
        s += functions.join(", ");
    return s;
}




str.echo = function () {
    //args
    var args = [].slice.call(arguments);

    //helper function to map args
    function format(o) {

        //result string
        var s = '';

        //typeof next argument
        switch(typeof(o)) {

            case 'undefined':
                s += 'undefined'
                break;

            case 'object':
                
                if(o && o[Symbol.toStringTag]) {
                    s += "/* [object " +  o[Symbol.toStringTag] + "] */ "; 
                } else if (o && o.__proto__ && o.__proto__.constructor && o.__proto__.constructor.name) {
                    s += "/* [object " +  o.__proto__.constructor.name + "] */ ";
                }

                if(o === null) {
                    s += "null";
                } else if(o instanceof Error) {
                    s += util.inspect(o);
                } else if (Array.isArray(o)) {
                    s += "/* [object Array("+  o.length + ")] */";
                    s += util.inspect(o);
                } else {
                    s += str.obj(o);
                }
                break;

            case 'function':
                if(o.prototype && o.prototype.constructor && o.prototype.constructor.name) {
                    s += "/* [Function "  + o.prototype.constructor.name + "] */ ";    
                } 
                if(o.help) {
                    s += "/* " + o.help + " */ ";
                }
                s += o.toString();
                break;

            case 'string':                     
                s += o;
                break;
            default: 
                s += util.inspect(o);
                break;
        }
        return s;
    }
    //format each argument
    return args.map(x=>format(x)).join(', ') + " ";   
} 

str.dump = function (obj, wrapstart, wrapend) {
    wrapend = wrapend || "";

    //var result = "(" + typeof(obj) + ") {";
    var result = "";
    var quotation_marks;

    if (typeof (obj) != "object") {
        if (typeof (obj) == "string") {
            //quotation_marks = '';
			quotation_marks = '"';
        } else {
            quotation_marks = '';
        }

        result += quotation_marks + obj + quotation_marks;
    } else if (Array.isArray(obj)) {
        var more = false;
        result += "[ ";
        obj.forEach(function (elem, i) {
            if (more)
                result += ", ";
            result += str.dump(elem);
            more = true;
        });
        result += " ]";


    } else {
        var more = false;
        result += "{ ";
        for (var prop in obj) {
            if (more)
                result += ", "
            result += '"' + prop + '": ' + str.dump(obj[prop]);
            more = true;
        }
        result += " }";
    }

    if (wrapstart) {
        result = beautify(wrapstart + result + wrapend);
    }

    return result;
}

str.hex = function (dec) {
    var hexCode = dec.toString(16);
    if ((hexCode.length % 2) == 1) {
        hexCode = "0" + hexCode;
    }
    return "&#x" + hexCode + ";";
}

str.chr = function (text) {
    var buf = [];
    var chars = text.split('');
    chars.forEach(function (elem, index) {
        var dec = elem.charCodeAt(0);
        var hex = str.hex(dec);
        var buffer = new ArrayBuffer(2);
        var bufview = new Uint16Array(buffer);
        bufview[0] = elem.charCodeAt(0);
        buf.push({ 'char': elem, 'dec': dec, 'hex': hex, 'buffer': buffer });
    });
    return buf;
}


str.codePointAt = function(s, position) {
  if (s == null) {
    throw TypeError();
  }
  var string = String(s);
  var size = string.length;
  // `ToInteger`
  var index = position ? Number(position) : 0;
  if (index != index) { // better `isNaN`
    index = 0;
  }
  // Account for out-of-bounds indices:
  if (index < 0 || index >= size) {
    return undefined;
  }
  // Get the first code unit
  var first = string.charCodeAt(index);
  var second;
  if ( // check if it’s the start of a surrogate pair
    first >= 0xD800 && first <= 0xDBFF && // high surrogate
    size > index + 1 // there is a next code unit
  ) {
    second = string.charCodeAt(index + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
};


str.fromArrayBuffer = function (buf) { return String.fromCharCode.apply(null, new Uint16Array(buf)); }
str.toArrayBuffer = function (str) { var buf = new ArrayBuffer(str.length * 2); var bufView = new Uint16Array(buf); for (var i = 0, strLen = str.length; i < strLen; i++) { bufView[i] = str.charCodeAt(i); } return buf; }

module.exports = str;
