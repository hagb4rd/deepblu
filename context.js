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

/*
const IRCBOT_MAX_LINES = 4;
const IRCBOT_MAX_CHARS = 760;
const IRCBOT_SPLIT_LINE = 400;
const IRCBOT_INSPECT_DEPTH = 2;
const IRCBOT_FLOODPROTECTION_DELAY = 400;
const IRCBOT_EXECUTION_TIMEOUT = 12000;
/* */

//SLATE-IRC plugin
var evalJS = function(context, transpile) {
    return function (irc) {
        irc.on('command', function(msg) {
            console.log('irc.on("command")','\r\n-------------------------\r\n', util.inspect(msg, {depth: 1, showHidden: false, colors: false}));
            
            
            //var temp = extend(true, context, GLOBAL);
            var cx = vm.createContext(context.cx);
            
            //circular
            cx.cx = cx;

            cx.su = function(passphrase) {
                return function(pass, hostmask) {
                    if(msg && msg.hostmask && msg.hostmask.user) {
                        hostmask = hostmask || msg.hostmask.user;
                    } else if (!hostmask) { 
                        throw TypeError('su(password, hostmask): missing argument');
                    }
                    if(pass===passphrase) {
                        if(!context.bot.authorize.includes(hostmask)) {
                            context.bot.authorize.push(hostmask);
                        }
                        return hostmask + " is now authorized."  
                    } else {
                        return 'access denied.';
                    }
                }
              }(process.env['DEEPBLU_IRC_PASS']);
            


            cx.console = require('./lib/logwriter');

            //allow log access in public mode
            if(!msg.private) {
                cx.log = {
                    from: function(date) {
                        date = date || (new Date(Date.now() - msg.log.defaultTimeFromNow));
                        var channel = msg.to;

                        return msg.log.from(date, channel).then(result => { 
                            cx.console.log(result);
                            return result;
                        });
                    },
                    search: function(query) {
                        var channel = msg.to; 
                        return msg.log.search(query, channel).then(result => { 
                            cx.console.log(result);
                            return result;
                        });
                    }
                }
            };

            cx.admin = function() { 
                        if(msg.authorized) { 
                            return context.getSecureContext(); 
                        } else {

                            return "access denied.";
                        }
                    };
            
            
            
            

            //Format functions
            cx.console.format = function(obj) {
                //log to terminal using util.inspect
                //console.log(cx.console.format.terminal(obj)); 
                



                if(obj instanceof Promise || typeof(obj) === 'undefined' || obj === 'use strict' ) { 
                    return undefined; 
                } else if (typeof(obj)==='string') { 
                    return obj; 
                } else if (typeof(obj)==='function') {
                    return obj.toString();
                //} else if (obj instanceof Error) {
                //    throw(obj); //return cx.console.format.error(obj, "log: "); 
                } else if ((typeof(obj)==='object') && (!Array.isArray(obj))) {
                    var result = context.str.echo(obj);
                    var proto=Object.getPrototypeOf(obj);
                    if(proto) {
                        result += " | prototype: " + str.echo(proto);
                    }
                    return result;
                } else {
                    return util.inspect(obj,{showHiden:null,depth:1, colors: false});
                }
                
            };
            cx.console.format.error = function(e, message) {
                message=str.stripAnsi(message)||"Error: ";
                var stack = str.stripAnsi(e.stack).split("\n");
                stack[0] = message + " " + str.stripAnsi(e.message) + ", " + stack[0];
                return stack.slice(0,3).join("\n");
            };
            cx.console.format.object = function(obj) {
                var result = context.str.echo(obj);
                if(typeof(obj)=='object') {
                    var proto=Object.getPrototypeOf(obj);
                    if(proto) {
                        result += " | prototype: " + str.echo(proto);
                    }
                }
                return result; 
            };
            cx.console.format.terminal = function(e) {
                return util.inspect(e, {showHidden: context.config.inspect.showHidden, depth: context.config.inspect.depth, colors: context.config.inspect.colors})
            };
            //cx.console.maxLines = IRCBOT_MAX_LINES;
            cx.console.maxLines = context.config.bot.maxLines;
            if(msg.private)
                cx.console.maxLines = context.config.bot.maxLinesPrivate;
            
            cx.console.flushTimeout = null;

            cx.console.flush = function() {    
                //max length line example: maxLine -("earendel".length  + ": ".length); 
                var splitLine = context.config.bot.splitLine - (msg.from.length + 2);
                var maxChars = context.config.bot.maxChars;
                if(msg.private) {
                    maxChars = context.config.bot.maxCharsPrivate;
                }
                
                //grab and join all messages from the current receipent that are not undefined 
                var next = msg.buffer.filter(x=>(typeof(x) !== 'undefined')).join('\n\n');
                //reset buffer
                msg.buffer = [];

                if(next) {
                    //holds reply for IRC client -> msg.reply() 
                    return new Promise(function(resolve, reject) {
                        var reply = "";
                        if(next.length > maxChars) {
                            gist(next, (new Date).toISOString() + " " + msg.to, msg.from +": "+msg.command).then(function(link) {
                                reply = next.slice(0,maxChars) + " [..] read more: ";
                                reply = reply.replace(/\r/gi, '').replace(/\n/gi, ' ').replace(/\t/gi, ' ').replace(/\s+/gi,' ');
                                reply += "\n" + link; 
                                resolve(context.str.chunkify(reply, splitLine));
                            }) 
                        } else {
                            reply = next.replace(/\r/gi, '').replace(/\n/gi, ' ').replace(/\t/gi, ' ').replace(/\s+/gi,' ');
                            resolve(context.str.chunkify(reply, splitLine))
                        }   
                    }).then(chunks => {
                        chunks.forEach(chunk=>msg.reply(chunk));
                    });
                }
            };        
            cx.console.error = function(e, message) {                
                var stack = cx.console.format.error(e, message).split('\n');    
                
                if(msg.private) {
                    msg.reply(stack[0]);
                    msg.reply(stack[1]);
                    msg.reply(stack[2]);
                } else {
                    irc.notice(msg.from, stack[0]);
                    irc.notice(msg.from, stack[1]);
                    irc.notice(msg.from, stack[2]);    
                }         
            };

            /**
             * Writes to irc client & console
             */
            cx.console.log = function() {
			    
                var args = [].slice.call(arguments);
                
                var buffer = args.map(obj => cx.console.format(obj));
                
                if(typeof(msg.buffer) === 'undefined') {
                    msg.buffer = [];
                }
                msg.buffer = msg.buffer.concat(buffer);
                    
                if(msg.buffer.length > 0) {
                    if(!cx.console.flushTimeout) {
                        if(cx.console.maxLines >= 0) { 
                            cx.console.flushTimeout = setTimeout(function() {
                                cx.console.maxLines--;
                                cx.console.flushTimeout = undefined; 
                                cx.console.flush();
                            }, context.config.bot.floodProtection);  
                        }
                    }
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
                        res += util.inspect(obj, {showHidden: false, depth: 1, colors: false});
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
            // Eval Command
            /*=============*/

            cx.eval = function eval(command, sandbox) {
                try {
                    sandbox = sandbox || cx;
                    var transpiled = command||'';
                    
                    if(context.babelify && context.config.BABELIFY) {
                        transpiled = context.babelify(command);
                    }
                    var script = new vm.Script(transpiled, { filename: 'context.vm', timeout: context.config.bot.timeout });
                    
                    if(!vm.isContext(sandbox)) {
                        sandbox = vm.createContext(sandbox);
                    }
                    var result = script.runInContext(sandbox);
                    cx.console.log(result);
                    return result;
                    //console.log("\r\n======================================================================\r\n",result,"\r\n======================================================================\r\n");    
                } catch(e) {
                    cx.console.error(e, "catch: ");            
                }
            }
            cx.eval(msg.command, cx)
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
    context.util = require('util');
    /*
    //todo:
    context.util.inspect.config = {
        depth: 1,
        showHidden: false,
        colors: false
    };
    /* */
    context.es5 = require('es5-shim');
    context.es6 = require('es6-shim');
    context.es7 = require('es7-shim');
    context.qs = require('querystring');
    context.vm = require('vm');
    context.net = require('net');
    context.http = require('http');
    context.Promise = require('bluebird');
    context.lib = require('./lib/functions');
    context.str = require('./lib/string');
    context.cheerio = require('cheerio');
    context._ = require('underscore');
    context.moment = require('moment');
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
    context.babel.opt = { presets: ["es2015"], plugins:["syntax-async-functions", "transform-regenerator", "transform-async-to-generator", "transform-async-to-module-method"] };
    context.babelify = function(code, opt) {
        opt = opt || context.babel.opt;
        var transpiled = context.babel.transform(code, opt).code;
        console.log("\n", "BABELIFY:","\n======================\n", transpiled, "\n-----------------------\n\n");
        return transpiled;
    }
    
    //IRC-BOT SETUP
    //-------------
    context.Bot = require('./bot');
    context.bot = context.Bot.create();
    
    //context.cx.log = context.log;
    context.bot.client.use(evalJS(context /* context.babelify */));
    context.bot.channel.forEach(chan=>context.bot.client.join(chan));

    
    
    //context.cd & context.ls 
    context.cd = context; 
    Object.defineProperty(context, 'ls', {
        get: function() {
            return util.inspect(context.cd, {showHidden:false, depth: 1});
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
                //logText += util.inspect(obj, {showHidden:context.config.inspect.showHidden||false, depth: context.config.inspect.depth||0, colors: context.config.inspect.colors||true});
                //logText += "\n\n";
                context.stack.push(obj);    
            }
        });
        return Promise.resolve(logText);
    };
    //get latest item on stack
    Object.defineProperty(context, '__', {
        get: function() {
            if(context.stack.length) {
                return context.stack[context.stack.length - 1]
            } else {
                return undefined;
            }
        }
    });
    
    //define secure context for operators
    context.getSecureContext = function() { 
        return  {
            global: GLOBAL,
            process: GLOBAL.process,
            fs: require('fs'),
            bot: context.bot,
            config: context.config,
            require: require
        };
    } 

    //SAFE CONTEXT
    context.cx = function(cx) {
        
        return {
            __: cx.__,
            cx: cx.cx,
            config: cx.config,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            cheerio: cx.cheerio,
            _: cx._,
            moment: cx.moment,
            dirty: cx.dirty,
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
            push: cx.push,
            sleep: cx.sleep,
            str: cx.str,
            stack: cx.stack,
            images: cx.images
            
        }
    } (context);

};


