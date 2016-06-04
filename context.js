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
var config = require("./config");




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
                    if(cx.console.buffer.length && (!cx.console.flushTimeout)) {
                        cx.console.flushTimeout = setTimeout(function() {
                            cx.console.flushTimeout = null; 
                            cx.console.flush();
                        }, IRCBOT_FLOODPROTECTION_DELAY);  
                    }       
                }        
            };
            cx.console.error = function(e, message) {
                message=message||"";
                console.log(message, util.inspect(e));
                var stack = e.stack.split("\n");
                stack[0] = message + stack[0];
                
                irc.notice(msg.from, stack[0]);
                irc.notice(msg.from, stack[1]);
                irc.notice(msg.from, stack[2]);
                
            };
            cx.console.log = function(o) {
			    if(cx.console.maxLines > 0) {
	                cx.console.maxLines = cx.console.maxLines -1; 
	                var args = [].slice.call(arguments);
	                var text = args.map(obj=>{
                        console.log(util.inspect(obj, {showHidden:false, depth: null, colors: true})); 
	                    if(obj instanceof Promise) { 
	                        return undefined; 
	                    } else if (typeof(obj)=='string') { 
	                        return obj; 
	                    } else if (obj instanceof Error) {
                            cx.console.error(obj, "log: "); 
	                        return obj; 
	                    } else { 
	                        var result = str.echo(obj);
	                        if(typeof(obj)=='object') {
	                            var proto=Object.getPrototypeOf(obj);
	                            if(proto) {
	                                result += " | prototype: " + str.echo(proto);
	                            }
	                        }
	                        return result; 
	                    }
	                });
	                text.forEach(txt => {
	                    cx.console.buffer.push({msg: msg, text: txt});
	                });
								}
								/*
								if(cx.console.maxLines > 0) {
                    cx.console.maxLines = cx.console.maxLines -1;
                    var text = str.echo(obj);
                    if(typeof(obj)=='object') {
                        var proto=Object.getPrototypeOf(arg);
                        if(proto) {
                            text += " | prototype: " + str.echo(proto);
                        }
                    }
                    cx.console.buffer.push({msg: msg, text: text});
                }
								/* */
                if(!cx.console.flushTimeout) {
                    cx.console.flushTimeout = setTimeout(function() {
                        cx.console.flushTimeout = null; 
                        cx.console.flush();
                    }, IRCBOT_FLOODPROTECTION_DELAY);  
                }
            };
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
    context.config = Object.create(config);
        
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
        var code = context.babel.transform(code, opt).code;
        console.log("BABELIFY:\n","======================\n", code);
        return code;
    }
    
    //IRC-BOT SETUP
    //-------------
    context.Bot = require('./bot');
    context.bot = context.Bot.create();
    
    //context.cx.log = context.log;
    context.bot.client.use(evalJS(context, /* context.babelify */ context.babelify ));
    context.bot.channel.forEach(chan=>context.bot.client.join(chan));

    
    
    //context.cd & context.ls 
    context.cd = context; 
    Object.defineProperty(context, 'ls', {
        get: function() {
            return util.inspect(context.cd, {showHidden:true, depth: 0});
            //console.log(util.inspect(context.cd, {depth:null, showHidden:true, colors: true }));
        }
    });
    
    //Stack
    context.stack = [];
    //Imagestack
    context.images = [];
    context.push = function push() {
        
        var args = [].slice.call(arguments);
        
        var logText = "";
        args.forEach(obj => {
            if(obj) {
                logText += "cx.stack[" + context.stack.length + "]; // \n";
                logText += util.inspect(obj, {showHidden:context.config.inspect.showHidden||false, depth: context.config.inspect.depth||0, colors: context.config.inspect.colors||true});
                logText += "\n\n";
                context.stack.push(obj);    
            }
        });
        return Promise.resolve(logText);
    };
    //get latest item on stack
    Object.defineProperty(context, '__', {
        get: function() {
            if(context.length) {
                return context.stack[context.stack.length - 1]
            } else {
                return undefined;
            }
        }
    });
    
    //SAFE CONTEXT
    context.cx = function(cx) {
        var password = process.env['DEEPBLU_IRC_PASS'];
        return {
            __: cx.__,
            cx: cx.cx,
            config: cx.config,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            cheerio: cx.cheerio,
            process: {
                nextTick: process.nextTick
            },    
            util: cx.util,
            rp: cx.rp,
            request: cx.rp,
            google: cx.google,
            qs: cx.qs,
            net: cx.net,
            vm: cx.vm,
            babel: cx.babel,
            babelify: cx.babelify,
            regeneratorRuntime: cx.regeneratorRuntime,
            bitly: cx.bitly,
            Promise: cx.Promise,
            db: cx.db,
            lib: cx.lib,
            gist: cx.gist,
            images: cx.images,
            sleep: cx.sleep,
            str: cx.str,
            su: function(passphrase) {
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
                }
              }(password)
        }
    } (context);
};


