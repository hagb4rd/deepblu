var es5 = require('es5-shim');
var es6 = require('es6-shim');
var es7 = require('es7-shim');
var util = require('util');
var Promise = require('bluebird');


// Simulate pure virtual inheritance/'implement' keyword for JS
Function.prototype.implements = function (parent) {
    if (parent.constructor == Function) {
        // Normal Inheritance 
        this.prototype = new parent;
        this.prototype.constructor = this;
        this.prototype.parent = parent.prototype;
    } else {
        // Pure Virtual Inheritance 
        this.prototype = parent;
        this.prototype.constructor = this;
        this.prototype.parent = parent;
    }
    return this;
}


Object.allKeys = function allKeys(o) { var result = []; for(var obj = o; obj !== null; obj = Object.getPrototypeOf(obj)) { result.push({symbols:Object.getOwnPropertySymbols(obj),keys: Object.getOwnPropertyNames(obj).map(function(prop) { var p={name: prop}; var d=Object.getOwnPropertyDescriptor(obj,prop); if(d.value)p.value=d.value; if(d.get)p.get=d.get; if(d.set)p.set=d.set; return p; })}); }; return result; };
Object.defineProperty(Object.prototype, "allKeys", {
	get: function() {
		return Object.allKeys(this);
	}
});
//*
Object.prototype.allKeys = function() {
	return Object.getPropertyNames(this);
};

exports.Object = Object;

/* */
/*
	fugMe("!g lana del rey site:youtube.com", "lana.del.rey"); lana.del.rey // @ecmabot
/* */
var fugMe = function(value, chain, o) { o=o||this; chain = chain.split(".").reverse(); var prop = chain.pop(); if(prop) { if(chain.length  > 0) { o[prop] = {}; return fugMe(value, chain.reverse().join('.'), o[prop]) } else { return o[prop] = value || {} }; } };
exports.fugMe = fugMe;

String.leftFill = function lefFill(string, char, minlength)  {char=char||'0'; /* default: zerofill */ string = string.toString(); while (string.length < min) string = char + string; return string; }
String.prototype.leftFill = function(char, length) { return String.leftFill(this, char, minlength); }

String.rot13 = function (s) { return s.replace(/[a-zA-Z]/g, function (c) { return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26); });};
String.prototype.rot13 = function() { return String.rot13(this);  };

String.stripTags = function(s) { return s.replace(/<[^>]*>/gi, ""); };
String.prototype.stripTags = function() { return String.stripTags(this); };
exports.String = String;


Math.P = function P(x,y,z) {
	if(z) {
		return new Point3D(x,y,z);
	} else if (x instanceof Point2D) {
		return new Point3D(x.x,x.y, y);
	} else if (y instanceof Point2D) {
		return new Point3D(x, y.x, y.y);
	} else {
		return new Point2D(x,y);
	}

}

Math.Point2D = function Point2D(x,y) {
	this.x=x|0;
	this.y=y|0;
	this.toString = function() { return "(" + this.x +","+ this.y + ")"; };
}
Math.Point3D = function Point3D(x,y,z) {
	this.x=x|0;
	this.y=y|0;
	this.z=z|0;
	this.toString = function() { return "(" + this.x +","+ this.y + ","+ this.z + ")"; };
}

//cartesian product
//function P(x,y,z) { var p = {x:x,y:y}; var zs="" if(z) { p.z=z; zs=","+this.z; }; p.toString = function() {  return "("+this.x+","+this.y + zs ")" } return p; }
Math.AxB = function AxB(x,y,f) {f=f||((x,y,z)=>Math.P(x,y,z)); return x.map(a=>y.map(b=>f(x, y))); };

//hallo! porzyczycie mi ostateczny raz jeszcze 10eur prosze? 5eur na internet, i reszta na tabake. wpadl bym kr�tko po rower i kase. czesc tomek.
//function Shape() {}; function Rectangle() { Shape.call(this); } Rectangle.prototype = Object.create(Shape.prototype); /* Rectangle.prototype.constructor = Rectangle; */ var rect=new Rectangle();
//function Shape() { Rectangle.call(this); } Shape.prototype = Object.create(Rectangle.prototype);
var Shape = function Shape(x1,y1,x2,y2) { this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; }; Shape.prototype.overlaps = function (another) { return (this.x2 >= another.x1) && (this.y2 >= another.y1) && (this.x1 <= another.x2) && (this.y1 <= another.y2); }; var a=new Shape(10,10,200,200), b=new Shape(50,50,300,300); (a.overlaps(b)) //intersection?
Math.Shape = Shape;
exports.Math = Math;

if(!Array.flatten)
{
	Array.flatten = function flatten(array) { return [].concat.apply([], array); }
}


if(!Array.from) {
		Array.from = function(arrayLike) {
			return [].slice.call(arrayLike);
		}
}

Array.prototype.random = function() {
    if(this.length) {
        return this[Math.floor(Math.random()*this.length)];
    }
}

//Example: var access = Flags("execute","write","read"); (access.read | access.execute) //read or execute access
function Flags() { var flags={__proto__:Flags}; var args=[].concat.apply([], [].slice.call(arguments)); args.forEach((name,index) => { Object.defineProperty(flags, name, {value:Math.pow(2,index), writable: false, enumerable: true }); }); return flags; };
exports.Flags = Flags;


var Buffer = {};
Buffer.uint32 = function uint32() { return [].slice.call(new Uint32Array([].slice.call(arguments))).map(function(x) { return ('00000000'+x.toString(16)).slice(-7) }); };
Buffer.float64 = function float64() { return [].slice.call(new Uint32Array(new Float64Array([].slice.call(arguments)).buffer)).map(function(x) { return ('00000000'+x.toString(16)).slice(-7) }); };
exports.Buffer = Buffer;



/**
 * Math - generate random integer value between min and max, or between 0 and min-1 if only 1 argument
 *
 * @param  {Number} min description
 * @param  {Number} max description
 * @return {Number}     description
 */
Math.rand = function(min, max) {
	if ((max == undefined) && (min != undefined)) {max=min-1;min = 0;}
	else if (min == undefined) {min=1;max=100;}
	var range = max - min;
	return Math.round(Math.random() * range) + min;
}

/*
Math.Probe = function Probe(array) { var p = { events: array, total: function() { return array.map(x=>x.weight).reduce((prev, curr) => prev+curr) }, addEvent: function(weight, name, obj){ obj=obj||{}; obj.name=name||"P"+this.events.length; obj.weight=weight||0; this.events.push(obj); this.init(); }, init: function() { var nextmin=0;  for(var i=array.length;i-->0;) { this.events[i].chance=array[i].weight/this.total(); this.events[i].min=nextmin; this.events[i].max=this.events[i].chance+nextmin;  } }, emit: function(n) { if(n>1) { var pArr = []; while(n-->0) pArr.push(this.emit()) return pArr; } var rand = Math.random(); var event=this.events.filter(e=>((rand >= e.min) && ( rand < e.max)))[0]; if(!event.count) event.count=0; event.count++; return {event: event.name, chance: event.chance, count: even.count }; } }; p.init(); return p; };
/* */
function Probe(array) {
	array = array || [];
  var p = {
    _private: {
        events: array
    },
    get events() {
      return this._private.events;
    },
    set events(array) {
        this._private.events = array;
        this.init();
    },
    get total() {
      return this.events.map(x => x.weight).reduce((prev, curr) => prev + curr)
    },
    emitted: [],
    addEvent: function(weight, name, obj) {
      obj = obj || {};
      obj.name = name || "P" + this.events.length;
      obj.weight = weight || 1;
      this._private.events.push(obj);
      this.init();
    },
    init: function() {
			this.emitted = [];
      var nextmin = 0;
      for (var i = this.events.length; i--> 0;) {
        this.events[i].chance = this.events[i].weight / this.total;
        this.events[i].min = nextmin;
        this.events[i].max = this.events[i].chance + nextmin;
				nextmin = this.events[i].max;
      }
    },
    toString: function() {
        return this.events.map(event=>{ return event.name + " (" + (event.chance*100).toFixed(2) + "%) : " + event.count + " / " + this.emitted.length; }).join(" | ");
    },
    emit: function(n) {

        if(this.events.length <= 0)
          throw Error('No events specified.');

        if (n > 1) {
            while (n--> 0) {
                var event = this.emit()
            };
            return this.emitted;
        }

        var rand = Math.random();
        var event = this.events.filter(e => ((rand >= e.min) && (rand < e.max)))[0];
        if (!event.count)
                event.count = 0;
        event.count++;
            this.emitted.push(event);
        return event;
    }
  };
  p.init();
  return p;
};

exports.Probe = Probe;


exports.fb = {
    icons: "﻿🍀🌱🌹🌸💐🌻🌟⭐🌙☀⚡🔥👄💋✊✨🎩👆👉🎵🎼🎧🎈😹😌🐺🐾🐴🐎🍓💖💃👯👱👸👧👩👻👼🎭💎",   
    links: [
        {title:"daddy's little princess", url:"http://hagb4rd.tumblr.com/post/142329606174/daddys-little-princess", tags:"flowerstory animated lolita"}
    ]
};

var path = [ 
  'C:\\Users\\hagb4rd\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs',
  'C:\\Windows',
  'C:\\Windows\\system32',
  'C:\\Windows\\System32\\Wbem',
  'C:\\Windows\\System32\\WindowsPowerShell\\v1.0',
  'C:\\nodejs',
  'C:\\Users\\hagb4rd\\AppData\\Roaming\\npm',
  'S:\\#shell',
  'S:\\Tools\\PortableGit\\bin',
  'S:\\tools\\PortableGit\\cmd',
  'S:\\tools\\PortableGit\\usr\\bin',
  'S:\\tools\\MongoDB\\bin',
  'S:\\tools\\mongodb',
  'S:\\tools',
  'S:\\#shell\\PS',
  'C:\\DevKit\\bin',
  'C:\\GTK\\bin',
  'C:\\PYTHON27',
  'C:\\msys64',
  'C:\\Users\\hagb4rd\\AppData\\Local\\atom\\bin',
  'C:\\ProgramFiles(x86)\\IISExpress',
  'C:\\ProgramFiles(x86)\\PHP\\v5.6',
  'C:\\Windows\\Microsoft.NET\\Framework64\\v3.5',
  'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319',
  'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319',
  'C:\\ProgramFiles(x86)\\MSBuild\\12.0\\bin',
  'C:\\ProgramFiles(x86)\\MicrosoftSDKs\\Windows\\v7.0A\\bin',
  'C:\\ProgramFiles(x86)\\MicrosoftSDKs\\Windows\\v7.0A\\bin\\NETFX4.0Tools\\x64',
  'C:\\ProgramFiles(x86)\\MicrosoftSDKs\\Windows\\v7.0A\\bin\\x64',
  'C:\\vs2013\\VC\\BIN',
  'C:\\vs2013\\VC\\VCPackages',
  'C:\\vs2013\\Common7\\IDE',
  'C:\\vs2013\\Common7\\Tools',
  'S:\\tools\\ImageMagick',
  'C:\\Program Files (x86)\\Microsoft VS Code\\bin',
  'C:\\Program Files (x86)\\Microsoft SDKs\\F#\\3.1\\Framework\\v4.0\\',
  'C:\\Program Files (x86)\\Microsoft SDKs\\TypeScript\\1.0',
  'C:\\Program Files (x86)\\MSBuild\\12.0\\bin',
  'C:\\vs2013\\Common7\\IDE\\',
  'C:\\vs2013\\VC\\BIN',
  'C:\\vs2013\\Common7\\Tools',
  'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319',
  'C:\\vs2013\\VC\\VCPackages',
  'C:\\Program Files (x86)\\HTML Help Workshop',
  'C:\\vs2013\\Team Tools\\Performance Tools',
  'C:\\Program Files (x86)\\Windows Kits\\8.1\\bin\\x86',
  'C:\\Program Files (x86)\\Microsoft SDKs\\Windows\\v8.1A\\bin\\NETFX 4.5.1 Tools\\',
  'C:\\Program Files (x86)\\Microsoft SDKs\\F#\\3.1\\Framework\\v4.0\\',
  'C:\\Program Files (x86)\\Microsoft SDKs\\TypeScript\\1.0',
  'C:\\Program Files (x86)\\MSBuild\\12.0\\bin',
  'C:\\vs2013\\Common7\\IDE\\',
  'C:\\vs2013\\VC\\BIN',
  'C:\\vs2013\\Common7\\Tools',
  'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319',
  'C:\\vs2013\\VC\\VCPackages',
  'C:\\Program Files (x86)\\Windows Kits\\8.1\\bin\\x86',
  'C:\\Program Files (x86)\\Microsoft SDKs\\Windows\\v8.1A\\bin\\NETFX 4.5.1 Tools\\' 
]

//Catch uncaught errors
process.on('uncaught', function(e) {
    console.log(util.inspect(e,{showHidden: true, depth:null, color: true}));;
});
