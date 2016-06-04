
//================== TEMP ====================
/*
async function gif(query, start, num) { start=start||1; num=num||1; var all=[]; for(var i=0;i<num;i++) { var result = await google.gif.search(query,start+(i*10)); if(Array.isArray(result)) {  all=all.concat(result); } stack.push(all); var paste="```\n#" + query + "\n";  paste += all.items.map(item=>"![" + item.title + "](" + item.link + ")\n").join('- - -\n'); var link=await gist(paste); console.log(query + " | " + link); }; };
/* */
//================== TEMP ====================

var util = require('util');
var Promise = require('bluebird');


var logical = {
    nand: function (a, b) {
            return !(a && b);
    },
    not:  function (a)    {
            return this.nand(a, a);
    },
    and:  function (a, b) {
            return this.not(this.nand(a, b));
    },
    or:   function (a, b) {
            return this.nand(this.not(a), this.not(b));
    },
    nor:  function (a, b) {
            return this.not(this.or(a, b));
    },
    xor:  function (a, b) {
            return this.and(this.nand(a, b), this.or(a, b));
    },
    xnor: function (a, b) {
            return this.not(this.xor(a, b));
    }
};
exports.logical = logical;

var GUID = function GUID() { function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }; return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4(); } 
exports.GUID = GUID;

var girls = function girls(q, p, r, t, s) {
    q = q || 'jeans+ass';
    q = q.replace(' ', '+');
    p = p || 1;
    r = r || 5;
    t = t || 22;
    s = s || 8;
    return 'http://hagb4rd.gizmore.org/gallery/slideshow.html?p=' + p + '&r=' + r + '&t=' + t + '&sleep=' + s + '&fadeout=2&autoplay=1&jailbait=' + q;
};
//exports.girls = girls;

// Simulate pure virtual inheritance/'implement' keyword for JS
var inherits = function (parent) {
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
exports.inherits = inherits;
Function.prototype.inherits = inherits;

var allKeys = function allKeys(o) { var result = []; for(var obj = o; obj !== null; obj = Object.getPrototypeOf(obj)) { result.push({symbols:Object.getOwnPropertySymbols(obj),keys: Object.getOwnPropertyNames(obj).map(function(prop) { var p={name: prop}; var d=Object.getOwnPropertyDescriptor(obj,prop); if(d.value)p.value=d.value; if(d.get)p.get=d.get; if(d.set)p.set=d.set; return p; })}); }; return result; };
exports.allKeys = allKeys;
//Object.prototype.allKeys = function() { return allKeys(this); };

var xx = function(o) { var s=Object.getOwnPropertyNames(o).sort().map(key=>{var v=o[key]; var s=key; switch(typeof(v)=='object') { case 'object': if(Array.isArray(v)) { s+="[]"; } break; case 'function': s+="()"; break; default: s+=':'+v; }; return s; }).join(','); return { text:s, get __proto__() { var parent = Object.getPrototypeOf(o); if(parent) { return xx(parent) } else { return null; } } } } 

/* */
/*
	fugMe("!g lana del rey site:youtube.com", "lana.del.rey"); lana.del.rey // @ecmabot
/* */
var fugMe = function(value, chain, o) { o=o||this; chain = chain.split(".").reverse(); var prop = chain.pop(); if(prop) { if(chain.length  > 0) { o[prop] = {}; return fugMe(value, chain.reverse().join('.'), o[prop]) } else { return o[prop] = value || {} }; } };
exports.fugMe = fugMe;


//var lpad = (len, pad, foo) => (new Array(len+1).join(pad) + foo).slice(-1*len);
var lpad = (len, pad, num) => new Array(Math.max(0, len - String(0, Math.floor(num)).length + 1)).join(pad) + num; 
exports.lpad = lpad;
//String.prototype.leftFill = function(char, length) { return leftFill(this, char, minlength); }

var rot13 = function rot13(s) { return s.replace(/[a-zA-Z]/g, function (c) { return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26); });};
exports.rot13 = rot13;
//String.prototype.rot13 = function() { return rot13(this);  };

var stripTags = function stripTags(s) { return s.replace(/<[^>]*>/gi, ""); };
exports.stripTags = stripTags; 
//String.prototype.stripTags = function() { return stripTags(this); };

var Vector2D = {x:0, y:0, create: function(x, y) { var v = Object.create(Vector2D); v.x=x;v.y=y; return v; }, get length() { return Math.sqrt(this.x*this.x + this.y*this.y) }, norm() { return this.create(this.x/this.length, this.y/this.length)  }  };
exports.Vector2D = Vector2D; 

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
var AxB = function AxB(x,y,f) {f=f||((x,y,z)=>Math.P(x,y,z)); return x.map(a=>y.map(b=>f(x, y))); };
exports.AxB = AxB;


//hallo! porzyczycie mi ostateczny raz jeszcze 10eur prosze? 5eur na internet, i reszta na tabake. wpadl bym kr�tko po rower i kase. czesc tomek.
//function Shape() {}; function Rectangle() { Shape.call(this); } Rectangle.prototype = Object.create(Shape.prototype); /* Rectangle.prototype.constructor = Rectangle; */ var rect=new Rectangle();
//function Shape() { Rectangle.call(this); } Shape.prototype = Object.create(Rectangle.prototype);
var Shape = function Shape(x1,y1,x2,y2) { this.x1=x1; this.y1=y1; this.x2=x2; this.y2=y2; }; Shape.prototype.overlaps = function (another) { return (this.x2 >= another.x1) && (this.y2 >= another.y1) && (this.x1 <= another.x2) && (this.y1 <= another.y2); }; var a=new Shape(10,10,200,200), b=new Shape(50,50,300,300); (a.overlaps(b)) //intersection?
exports.Shape = Shape;
exports.Math = Math;


var flatten = function flatten(array) { return [].concat.apply([], array); }
exports.flatten=flatten;
if(!Array.flatten)
{
    Array.flatten=flatten;
}
if(!Array.from) {
		Array.from = function(arrayLike) {
			return [].slice.call(arrayLike);
		}
}

var randomElement = function randomElement(array) {
    if(array.length) {
        return array[Math.floor(Math.random()*array.length)];
    } else {
        return null;
    }
}
var range = function range(a, b) { for (var r = []; r.length <= b - a; r.push(a + r.length)); return r; };
exports.range = range;

exports.randomElement = randomElement;
Array.prototype.random = function() { return randomElement(this); }
var shuffle = function shuffle(o) { for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x); return o; };
exports.shuffle = shuffle;
Array.prototype.shuffle = function() { return shuffle(this); }

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
var rand = function rand(min, max) {
	if ((max == undefined) && (min != undefined)) {max=min-1;min = 0;}
	else if (min == undefined) {min=1;max=100;}
	var range = max - min;
	return Math.round(Math.random() * range) + min;
}
exports.rand = rand;
Math.rand = rand;


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

Promise.resolveDelayed = function(x, ms) {return function(delay, overwrite) { delay = delay||ms||1000; return new Promise((resolve, reject) => { setTimeout(function() { return resolve(x || overwrite || delay) }, delay ); }) } };
Promise.resolveDelayed.help = "var sleep = Promise.resolveDelayed(23); sleep(1000).then(x=>console.log(x)).catch(console.log);" 
Promise.taskify = function (arr) { if(!arr) throw TypeError('missing argument: Promise.all(lib.taskify(1,2,3).map(task=>task())).then(console.log)'); if(!Array.isArray(arr)) arr = [].slice.call(arguments);  return arr.map(n => () => new Promise(resolve => resolve(n))); }
Promise.taskify.help = "Promise.all(Promise.taskify(1,2,3).map(task=>task())).then(console.log)";
Promise.queue = require('concurrent-task-queue');
Promise.queue.help = "var sequence = Promise.queue([()=>sleep(10*1000), ()=>Promise.resolve(23).then(console.log)], 1); sequence() // example: https://jsfiddle.net/mhq3qg5w/"
//Promise.prototype.inspect = function() { return undefined; };


Promise.tasks = [
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7279.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7278.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7277.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7276.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7275.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7274.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7273.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7272.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7271.png"),
	()=>Promise.resolve("http://www.free-emoticons.com/files/funny-emoticons/7270.png")
];

exports.resolveDelayed = Promise.resolveDelayed;
exports.taskify = Promise.taskify;
exports.queue = Promise.queue; 


exports.fb = {
    icons: "﻿🍀🌱🌹🌸💐🌻🌟⭐🌙☀⚡🔥👄💋✊✨🎩👆👉🎵🎼🎧🎈😹😌🐺🐾🐴🐎🍓💖💃👯👱👸👧👩👻👼🎭💎",   
    links: [
        {title:"daddy's little princess", url:"http://hagb4rd.tumblr.com/post/142329606174/daddys-little-princess", tags:"flowerstory animated lolita"}
    ]
};
           
            
 
exports.leaves = function* leaves(tree) { for(var key of Object.keys(tree)){ if(typeof tree[key] === 'object' && tree[key] !== null){ yield* leaves(tree[key]); } else { yield tree[key]; } } };
exports.leaves.help = 'for(var leaf of leaves(tree)) { console.log(leaf); } //use function* leaves(tree) to iterate over hiearchies/nodeLists';
exports.leaves.tree = { year: 2016, user: 'earendel',  leaves: { leafA: 'blue', leafB: 'red', leafC: {'cheeks': 'yummy' } } };

