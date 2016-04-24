//require("babel-polyfill");
//*
es5shim = require('es5-shim');
es6shim = require('es6-shim');
es7shim = require('es7-shim');
/* */
var babel = require("babel-core");
var net = require('net');
var util = require('util');
var vm = require('vm');
var extend = require('extend');
var gist = require("./lib/gist");


const IRCBOT_MAX_LINES = 3;
const IRCBOT_MAX_CHARS = 760;
const IRCBOT_SPLIT_LINE = 400;
const IRCBOT_INSPECT_DEPTH = 0;
const IRCBOT_FLOODPROTECTION_DELAY = 400;
const IRCBOT_EXECUTION_TIMEOUT = 12000;

//SLATE-IRC plugin
var evalJS = function(context, transpile) {
    return function (irc) {
        irc.on('command', function(msg) {
            var cx = vm.createContext(extend(true, {}, context));
            cx.console = {};
            cx.console.buffer = [];
            cx.console.maxLines = IRCBOT_MAX_LINES;
            cx.console.flushTimeout = null;
            cx.console.flush = function() {    
                var next = cx.console.buffer.pop();
                if(next)
                    var sendMsg = next.msg.from + ": " + next.text.replace(/\r/gi, '').replace(/\n/gi, ' ').replace(/\t/gi, ' ').replace(/\s+/gi,' ');
                    if(sendMsg.length > IRCBOT_SPLIT_LINE) {
                        var part1=sendMsg.slice(0,IRCBOT_SPLIT_LINE);
                        var part2=next.msg.from +": "+sendMsg.slice(IRCBOT_SPLIT_LINE,IRCBOT_MAX_CHARS);
                        irc.send(next.msg.to, part1);
                        if(sendMsg.length > IRCBOT_MAX_CHARS) {
                            gist(next.text, (new Date).toISOString() + " " + next.msg.to, msg.from +": "+msg.command).then(function(link) {
                                part2 = part2 + " [..] read more: " + link;
                                irc.send(next.msg.to, part2);
                            });
                        } else {
                            irc.send(next.msg.to, part2);
                        }
                    } else {
                        irc.send(next.msg.to, sendMsg.slice(0,IRCBOT_SPLIT_LINE));    
                    }
                        
                    
                if(cx.console.buffer.length) {
                    cx.console.flushTimeout = setTimeout(cx.console.flush, IRCBOT_FLOODPROTECTION_DELAY);
                } else {
                    cx.console.flushTimeout = null;
                }
            }
            cx.console.log = function() {
                if(cx.console.maxLines > 0) {
                    cx.console.maxLines = cx.console.maxLines -1; 
                    var args = [].slice.call(arguments);
                    var text = args.map(arg=>{ if(typeof(arg)=='string') { return arg; } else { return util.inspect(arg, {depth:IRCBOT_INSPECT_DEPTH, showHidden:false,colors:false}); }}).join('\r\n');
                    cx.console.buffer.push({msg: msg, text: text});
                    if(!cx.console.flushTimeout)
                        cx.console.flush();
                }
            }            
            try {
                
                var transpiled = msg.command;
                if(transpile) {
                   transpiled = transpile(msg.command);
                }
                var script = new vm.Script(transpiled, { filename: 'context.vm', timeout: IRCBOT_EXECUTION_TIMEOUT });
                var result = script.runInContext(cx);
                cx.console.log(result);    
            } catch(e) {
                cx.console.log(e);
            }
            
        });
    }
    
} 
    


module.exports = function REPLContext(repl) {
    
    //var context = this (REPLContext.prototype) extends GLOBAL;
    var context = extend(true, this, GLOBAL);
    //contextitify for use with vm module
    vm.createContext(context);    
    //add self reference
    if (repl)
        context.repl = repl;
        
    // NPM MODULES
    // -----------
    context.global = context;
    context.root = context;
    context.GLOBAL = context;
    context.process = {};
    
    context.repl.context.global = context;
    context.repl.context.root = context;
    context.repl.context.GLOBAL = context;
    context.repl.context.process = {};
    //
    //context.es5shim = require('es5-shim');
    //context.es6shim = require('es6-shim');
    //context.es7shim = require('es7-shim');
    //context.fs = require('fs');
    
    context.util = require('util');
    context.util.inspect.config = {
        depth: 1,
        showHidden: false,
        colors: false
    };
    
    context.qs = require('querystring');
    context.vm = require('vm');
    context.net = require('net');
    context.http = require('http');
    context.Promise = require('bluebird');
    context.request = require('request-promise');

    context.gist = require("./lib/gist");
    context.lib = require('./lib/functions');
    context.db = {};
    context.db.user = new(require('dirty'))('user.db');
    context.db.doc = new(require('dirty'))('doc.db');
    context.db.code = new(require('dirty'))('io.db');
    context.db.git = new(require('dirty'))('git.db');
    context.gist = require('./lib/gist');
    context.bitly = require('./lib/bitly');
    context.google = require('./lib/google');
    var googleImages = require('google-images');
    context.google.images = googleImages(process.env['GOOGLE_CSE_ALL_ID'], process.env['GOOGLE_APIKEY']);
    context.google.search = require('./lib/googlesearch').googlesearch;
    context.google.lucky = require('./lib/googlesearch').lucky;
    context.babel = require('babel-core');
    context.babelify = function(code, options) {
        options || {};
        return babel.transform(code, options).code;
    }
    var Bot = require('./bot');
    var bot = Bot.create();
    bot.client.use(evalJS(context, /* context.babelify */ null ));
    bot.channel.forEach(chan=>bot.client.join(chan));
    //context.bot = bot.client;
    context.su = (function() {
        var password = process.env['DEEPBLU_IRC_PASS'];
        return function(pass) {
            if(pass===password) {
                return {
                    global: GLOBAL,
                    process: process,
                    fs: require('fs'),
                    bot: bot,
                    require: require
                };
                
            } else {
                return 'access denied.';
            }
        };
    }());
    
 
    //Imagestack
    context.images = [];


    //Stack
    context.stack = [];
    context.push = function push(obj) {
        context.stack.push(obj);
        console.log(util.inspect(obj,{showHidden:true, depth:null, color:true}));
        return Promise.resolve(obj);
    };
    //get latest stack item
    Object.defineProperty(context, '__', {
        get: function() {
            if(context.stack.length) {
                return context.stack[context.stack.length - 1]
            } else {
                return undefined;
            }
        }
    });
    
    //context.cd & context.ls 
    context.cd = context; 
    Object.defineProperty(context, 'ls', {
        get: function() {
            console.log(util.inspect(context.cd, {depth:null, showHidden:true, colors: true }));
        }
    });
};

//Catch uncaught errors
process.on('uncaught', function(e) {
    console.log(util.inspect(e,{showHidden: true, depth:null, color: true}));;
});
