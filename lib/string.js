es5shim = require('es5-shim');
es6shim = require('es6-shim');
util = require('util');
beautify = require('js-beautify').js_beautify;



str = {};



str.repeat = function (_count) {
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
str.chunkify = function (str, size) {
    //A string to create chunks from
    str = str.toString();
    //Max. size of a chunk in characters
    size = parseInt(size);
    return str.match(RegExp(".{1," + size + "}", "gm"));
}
String.prototype.chunkify = function (size) {
    return str.chunkify(this, size);
}


str.rot13 = function (s) {
    return s.replace(/[a-zA-Z]/g, function (c) {
        return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
};

/*
String.prototype.rot13 = function () {
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

str.echo = function () {
    var str = '';
    var args = [].slice.call(arguments);

    args.forEach(function (o, index) {
      if (str.length > 0)
          str += ", ";

        if(o instanceof Error) {
          str += util.inspect(o);
        } else if (typeof (o) == 'object') {
            if (Array.isArray(o)) {
                str += util.inspect(o);
            } else {
                var objects = [];
                var functions = [];

                Object.keys(o).sort().forEach(function (prop, index) {
                    if (typeof (o[prop]) === 'function') {
                        functions.push(prop + '()');
                    } else if (Array.isArray(o[prop])) {
                        objects.push(prop + "[]");
                    } else {
                        objects.push(prop);
                    }
                });
                str += functions.join(", ");
                if (objects.length > 0) {
                    //if (str.length > 0)
                    //    str += ", ";
                    str += objects.join(", ");
                }
            }
        } else if (typeof (o) == 'function') {
            str += o.toString();
        } else if (typeof (o) == 'string') {
            str += o;
        } else {
            str += util.inspect(o);
        }
        str += " ";
    });
    return str;
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
