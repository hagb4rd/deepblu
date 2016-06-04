//require("babel-polyfill");
//*
require('es5-shim');
require('es6-shim');
require('es7-shim');
/* */
var babel = require("babel-core");
var net = require('net');
var util = require('util');
var vm = require('vm');
var extend = require('extend');
var Promise = require('bluebird');
var str = require('./lib/string')
var gist = require("./lib/gist");
var logdb = require("./logdb");
var regeneratorRuntime = require("regenerator-runtime");




const IRCBOT_MAX_LINES = 4;
const IRCBOT_MAX_CHARS = 760;
const IRCBOT_SPLIT_LINE = 400;
const IRCBOT_INSPECT_DEPTH = 2;
const IRCBOT_FLOODPROTECTION_DELAY = 400;
const IRCBOT_EXECUTION_TIMEOUT = 12000;

//SLATE-IRC plugin
var evalJS = function(context, transpile) {
    return function (irc) {
        irc.on('command', function(msg) {
            console.log('irc.on("command")','\r\n-------------------------\r\n', util.inspect(msg, {depth: null, shoHidden: true}));
            
            /*
            var sandbox = (function(context, msg, cs) {
                var console = {
                    buffer: [],
                    maxLines: IRCBOT_MAX_LINES,
                    flushTimeout: null,
                    format: {
                        error: function(e,message) {
                            message=message||"";
                            var stack = e.stack.split("\n");
                            stack[0] = message + stack[0];
                            return stack.slice(0,3).join("\n");
                        }
                    }
                };
                console.error = function(e, message) {
                    cs.log(message, util.inspect(e));
                    console.format.error(e, message).split("\n").forEach(line,lineNumber => {   
                        if(msg.private) {
                            console.log(line);
                        } else {
                            irc.notice(msg.from, line);    
                        }                 
                        
                    });
                };
                console.flush = function() {    
                    var next = "";
                    next += console.buffer.map(x=>x.text).join("\n");
                    console.buffer = [];
                    if(next.length) {
                        var sendMsg = next.replace(/\r/gi, '').replace(/\n/gi, ' ').replace(/\t/gi, ' ').replace(/\s+/gi,' ');
                        if((sendMsg.length + msg.from.length + 1) > IRCBOT_SPLIT_LINE) {
                            var part1=sendMsg.slice(0,IRCBOT_SPLIT_LINE);
                            var part2=sendMsg.slice(IRCBOT_SPLIT_LINE,IRCBOT_MAX_CHARS);
                            msg.reply(part1);
                            if(sendMsg.length > IRCBOT_MAX_CHARS) {
                                gist(next, (new Date).toISOString() + " " + msg.to, msg.from +": "+msg.command).then(function(link) {
                                    part2 = part2 + " [..] read more: " + link;
                                    msg.reply(part2);
                                });
                            } else {
                                msg.reply(part2);
                            }
                        } else {
                            //_temp:
                            msg.reply(sendMsg.slice(0,IRCBOT_SPLIT_LINE));
                            //irc.send(next.msg.to, sendMsg.slice(0,IRCBOT_SPLIT_LINE));    
                        }
                        if(console.buffer.length && (!console.flushTimeout) ) {
                                console.flushTimeout = setTimeout(function() {
                                    console.flushTimeout = null;
                                    console.flush();
                                }, IRCBOT_FLOODPROTECTION_DELAY);                            
                        }  
                    }
                };
                console.log = function() {
                        if(console.maxLines > 0) {
                            console.maxLines = console.maxLines -1; 
                            var args = [].slice.call(arguments);
                            var text = args.map(arg=>{ 
                                if(arg instanceof Promise) { 
                                    return undefined; 
                                } else if (typeof(arg)=='string') { 
                                    return arg; 
                                } else if (arg instanceof Error) { 
                                    return console.log(console.format.error(arg, 'console.log: ')); 
                                } else { 
                                    var result = str.echo(arg);
                                    if(typeof(arg)=='object') {
                                        var proto=Object.getPrototypeOf(arg);
                                        if(proto) {
                                            result += " | prototype: " + str.echo(proto);
                                        }
                                    }
                                    return result; 
                                }
                            });
                            text.forEach(txt => {
                                if(txt && (txt.toString().trim() != 'undefined')) {
                                    console.buffer.push({msg: msg, text: txt});
                                }
                            });
                            //var  text = cx.console.logn(IRCBOT_INSPECT_DEPTH)(obj);
                                
                            if(!console.flushTimeout) {
                                console.flushTimeout = setTimeout(function() {
                                    console.flushTimeout = null; 
                                    console.flush();
                                }, IRCBOT_FLOODPROTECTION_DELAY);  
                            }
                        }
                    }
                    
                    try {
                        var transpiled = msg.command;
                        if(transpile && context.cx.config.BABELIFY) {
                            transpiled = transpile(msg.command);
                        }
                        var result = eval(transpiled);
                        console.log(result);
                    } catch(e) {
                        console.error(e, "catch: ");            
                    }
                    
                    var sandbox = {};
                    Object.assign(sandbox, context.cx);
                    return sandbox;
                }).bind(context.cx, context, msg, console);
                /* */
            
            
            
            //var temp = extend(true, context, GLOBAL);
            var cx = vm.createContext(context.cx);
            cx.cx = cx;
            cx.console = require('./lib/logwriter');
            cx.console.buffer = [];
            cx.console.maxLines = IRCBOT_MAX_LINES;
            cx.console.flushTimeout = null;
            cx.console.flush = function() {    
                var next = cx.console.buffer.pop();
                if(next) {
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
                        //_temp:
                        msg.reply(sendMsg.slice(0,IRCBOT_SPLIT_LINE));
                        //irc.send(next.msg.to, sendMsg.slice(0,IRCBOT_SPLIT_LINE));    
                    }
                    if(cx.console.buffer.length) {
                            cx.console.flushTimeout = cx.setTimeout(cx.console.flush, IRCBOT_FLOODPROTECTION_DELAY);
                    } else {
                        cx.console.flushTimeout = null;
                    }
                        
                }
                    
            };
            cx.console.error = function(e, message) {
                message=message||"";
                var stack = e.stack.split("\n");
                stack[0] = message + stack[0];
                stack.forEach(line,lineNumber => {
                    if(lineNumber < 3)
                        irc.notice(msg.from, line);
                });
                console.log(message, util.inspect(e));
            };
            cx.console.log = function(obj) {
                if(cx.console.maxLines > 0) {
                    cx.console.maxLines = cx.console.maxLines -1; 
                    var args = [].slice.call(arguments);
                    var text = args.map(arg=>{ 
                        if(arg instanceof Promise) { 
                            return undefined; 
                        } else if (typeof(arg)=='string') { 
                            return arg; 
                        } else if (arg instanceof Error) { 
                            return cx.util.inspect(arg); 
                        } else { 
                            var result = str.echo(arg);
                            if(typeof(arg)=='object') {
                                var proto=Object.getPrototypeOf(arg);
                                if(proto) {
                                    result += " | prototype: " + str.echo(proto);
                                }
                            }
                            return result; 
                        }
                    });
                    text.forEach(txt => {
                        if(txt && (txt.toString().trim() != 'undefined')) {
                            cx.console.buffer.push({msg: msg, text: txt});
                        }
                    });
                    //var  text = cx.console.logn(IRCBOT_INSPECT_DEPTH)(obj);
                        
                    if(!cx.console.flushTimeout) {
                        cx.console.flush();  
                    }
                  }
            }
            if(!cx.push) {
                cx.push = function(obj, more) {
                    
                    var args = [].slice.call(arguments);
                    if(args.length == 1) {
                        if(Array.isArray(args[0])) {
                            args = args[0];                            
                        }
                    } else if (!args.length) {
                        throw new TypeError("Missing arguments");
                    }
                    
                    if(!Array.isArray(cx.stack)) {
                        cx.stack = [];
                    }
                    
                    cx.stack.push(args);
                    cx.__ = args;
                    
                    var res = "";
                    args.forEach(obj => {
                        res += util.inspect(obj, {showHidden: true, depth: 2, colors: true});
                        // cx.console.logn(2)(obj);
                        
                    });
                               
                    if(cx.stack.length) {
                        var pos = cx.stack.length-1;
                        res = "stack[" + pos + "] <-//-- \r\n" + res;
                    }
                    cx.console.log(res);
                    return res;
                };    
            }
            
            //*
            try {
                var transpiled = msg.command;
                if(transpile && cx.config.BABELIFY) {
                   transpiled = transpile(msg.command);
                }
                var script = new vm.Script(transpiled, { filename: 'context.vm', timeout: IRCBOT_EXECUTION_TIMEOUT });
                var result = script.runInContext(cx);
                cx.console.log(result);
                
                console.log("\r\n======================================================================\r\n",result,"\r\n======================================================================\r\n");    
            } catch(e) {
                cx.console.error(e, "catch: ");            
            }
            /* */
            //Catch uncaught errors
            process.on('uncaught', function(e) {
                cx.console.error(e, "uncaught: ");
            });
            process.on('unresolved', function(e) {
                cx.console.error(e, "unresolved: ");
            });
            
        });
    }
    
} 
    


module.exports = function REPLContext(repl) {
    
    //var context = this (REPLContext.prototype) extends GLOBAL;
    var context = extend(true, this, global);
    //contextitify for use with vm module
    vm.createContext(context);    
    //add self reference
    if (repl)
        context.repl = repl;
        
    //configuration
    context.config = {
        BABELIFY: true,
        IRCBOT_MAX_LINES: 4,
        IRCBOT_MAX_CHARS: 760,
        IRCBOT_SPLIT_LINE: 400, 
        IRCBOT_INSPECT_DEPTH: 2,
        IRCBOT_FLOODPROTECTION_DELAY: 400,
        IRCBOT_EXECUTION_TIMEOUT: 12000
    };
        
    // NPM MODULES
    // -----------
    /*
    context.global = context;
    context.root = context;
    context.GLOBAL = context;
    context.process = {};
    /* */
    //context.repl.context.global = context;
    //context.repl.context.root = context;
    //context.repl.context.GLOBAL = context;
    //context.repl.context.process = {};
    //
    //context.es5shim = require('es5-shim');
    //context.es6shim = require('es6-shim');
    //context.es7shim = require('es7-shim');
    //context.fs = require('fs');
    
    context.util = require('util');
    context.util.inspect.config = {
        depth: 0,
        showHidden: false,
        colors: false
    };
    
    context.qs = require('querystring');
    context.vm = require('vm');
    context.net = require('net');
    context.http = require('http');
    context.Promise = require('bluebird');
    context.Promise.prototype.inspect = function() { return undefined; };
    context.lib = require('./lib/functions');
    context.str = require('./lib/string');
    context.cheerio = require('cheerio');
    context.Promise.resolveDelayed = context.lib.resolveDelayed;
    context.Promise.taskify = context.lib.taskify;
    context.Promise.queue = context.lib.queue;
    context.sleep = context.Promise.resolveDelayed();
    context.rp = require('request-promise');
    context.rp.help = "request-promise | https://github.com/request/request-promise/blob/master/README.md";
    context.request = context.rp;
    context.gist = require("./lib/gist");    
    context.dirty = {};
    context.dirty.user = new(require('dirty'))('user.db');
    context.dirty.doc = new(require('dirty'))('doc.db');
    context.dirty.code = new(require('dirty'))('io.db');
    context.dirty.git = new(require('dirty'))('git.db');
    context.gist = require('./lib/gist');
    //context.queue = require('concurrent-task-queue');
    context.bitly = require('./lib/bitly');
    context.google = require('./lib/google');
    var googleImages = require('google-images');
    context.google.images = googleImages(process.env['GOOGLE_CSE_ALL_ID'], process.env['GOOGLE_APIKEY']);
    context.google.search = require('./lib/googlesearch').googlesearch;
    context.google.lucky = require('./lib/googlesearch').lucky;
    context.regeneratorRuntime = require("regenerator-runtime");
    context.babel = require('babel-core');
    context.babelify = function(code, opt) {
        opt = opt || { presets: ["es2015"], plugins:["syntax-async-functions", "transform-regenerator", "transform-async-to-generator", "transform-async-to-module-method"] };
        return context.babel.transform(code, opt).code;
    }
    context.Bot = require('./bot');
    //Imagestack
    context.images = [];


    //Stack
    
    
    
    //context.cd & context.ls 
    context.cd = context; 
    Object.defineProperty(context, 'ls', {
        get: function() {
            return util.inspect(context.cd, {showHidden:true, depth: 0});
            //console.log(util.inspect(context.cd, {depth:null, showHidden:true, colors: true }));
        }
    });
    
    
    var cx ={};
    context.cx = cx;
    cx.__ = context.__;
    //Stack
    cx.stack = [];
    cx.push = function push() {
        var logText = "";
        var args = [].slice.call(arguments);
        
        args.forEach(arg,i,arr => {
            if(arg) {
                logText += "cx.stack[" + cx.stack.length + "]; // \n";
                logText += util.inspect(arg, {showHidden:true, depth: null, colors: false});
                logText += "\n\n";
                cx.stack.push(arg);    
            }
        });
        return Promise.resolve(logText);
    };
    //get latest stack item
    Object.defineProperty(context.cx, '__', {
        get: function() {
            if(context.cx.stack.length) {
                return context.cx.stack[context.stack.length - 1]
            } else {
                return undefined;
            }
        }
        
    });
    cx.config = context.config;
    cx.setTimeout = setTimeout;
    cx.clearTimeout = clearTimeout;
    cx.cheerio = context.cheerio;
    cx.process = {};
    cx.process.nextTick = process.nextTick;    
    cx.util = context.util;
    cx.rp = context.rp;
    cx.request = context.rp;
    cx.google = context.google;
    cx.qs = context.qs;
    cx.net = context.net;
    cx.vm = context.vm;
    cx.babel = context.babel;
    cx.babelify = context.babelify;
    cx.regeneratorRuntime = context.regeneratorRuntime;
    cx.bitly = context.bitly;
    cx.Promise = context.Promise;
    cx.db = context.db;
    cx.lib = context.lib;
    cx.gist = context.gist;
    cx.su = context.su;
    cx.images = context.images;
    cx.sleep = context.sleep;
    cx.str = context.str;
    
    
    
    context.cx = cx;
    context.bot = context.Bot.create();
    
    //context.cx.log = context.log;
    context.bot.client.use(evalJS(context, /* context.babelify */ cx.babelify ));
    context.bot.channel.forEach(chan=>context.bot.client.join(chan));
    
    
    cx.su = (function() {
        var password = process.env['DEEPBLU_IRC_PASS'];
        return function(pass) {
            if(pass===password) {
                return {
                    global: GLOBAL,
                    process: GLOBAL.process,
                    fs: require('fs'),
                    bot: context.bot,
                    config: context.config,
                    require: require
                };
                
            } else {
                return 'access denied.';
            }
        };
    }());
    
};


