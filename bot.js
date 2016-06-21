require('es5-shim');
require('es6-shim');
require('es7-shim');
var Promise = require('bluebird');
var promisify = require('./lib/promisify');
var irc = require('slate-irc');
var net = require('net');
var extend = require('extend');
var tls = require('tls');
var fs = require('fs');
var util = require('util');
var logdb = require("./logdb");



var config = {
    host: process.env['DEEPBLU_IRC_HOST'] || "irc.freenode.net",
    port: process.env['DEEPBLU_IRC_PORT'] || 6667,
    nick: process.env['DEEPBLU_IRC_NICK'] || "deepblu",
    user: process.env['DEEPBLU_IRC_USER'] || "",
    pfxFile: process.env['DEEPBLU_IRC_PFX_FILEPATH'],
    pfxPass: process.env['DEEPBLU_IRC_PFX_PASS'],
    authorize: [(process.env['DEEPBLU_IRC_AUTHORIZE'] || "")],
    trigger: [process.env['DEEPBLU_IRC_TRIGGER'] || "-->"],
    channel: (process.env['DEEPBLU_IRC_CHANNEL']).split(','),
    logging: false,
    unrestricted: false
    // DEEPBLU_IRC_PASS
};

function Bot(nick, user, pass, host, port) {
    var self = this;
    if (nick)
        self.nick = nick;
    if (user)
        self.user = user;
    if (host)
        self.host = host;
    if (port)
        self.port = port;
    
    self.log = logdb.Factory[self.host]();
    
    
    //Secure Socket?
    if (self.pfxFile && self.pfxPass) {
        console.log('SECURE CONNECTION..')
        var tlsOptions = {
            pfx: fs.readFileSync(self.pfxFile),
            passphrase: self.pfxPass,
            host: self.host,
            port: self.port
        };
        self.stream = tls.connect(tlsOptions, () => {
            console.log('Socket conntected', util.inspect(self.stream, { showHidden: false, depth: 0, colors: false }));
        })
    } else {
        self.stream = net.connect({ port: self.port, host: self.host });
    };


    self.client = promisify(irc(self.stream), true, ["names", "whois"]);
    self.client.pass(pass);
    self.client.nick(self.nick);
    self.client.user(self.user, self.user);

    //install plugins
    //self.client.use(pong());
    self.client.use(replcmd(self));
    self.client.use(logger(self));
};
Bot.prototype = config;

Bot.create = function (nick, user, pass, host, port) {
    nick = nick || config.nick;
    user = user || config.user;
    pass = pass || process.env['DEEPBLU_IRC_PASS'];
    host = host || config.host;
    port = port || config.port;
    return new Bot(nick, user, pass, host, port);
};

//Here's a slightly more complex example of a PONG plugin responding to PING messages:
function pong() {
    return function (irc) {
        irc.on('data', function (msg) {
            if ('PING' != msg.command) return;
            irc.write('PONG :' + msg.trailing);
        });
    };
};
function replcmd(bot) {
    return function (irc) {
        irc.on('message', function (msg) {


            //update user hostmask
            msg.hostmask.user = msg.hostmask.username + "@" + msg.hostmask.hostname; 


            //check authorization - if none of the the authorized user hostmasks matches the hostmask of the user who send message
            if (bot.authorize.every(authorized => authorized != msg.hostmask.user)) {
                msg.authorized = false;
            } else {
                msg.authorized = true;
            }

            
            //check if private message (query)
            if(msg.to==bot.client.me) {
                msg.private = true;
                msg.to=msg.from;
            } else {
                msg.private = false;
            }
            //generate reply function
            msg.reply = function(client, cx) {
                return function(s) {
                    client.send(cx.to, cx.from + ": " + s);   
                    console.log(cx.to, cx.from + ": " + s); 
                }
            }(irc, msg);
            
            //create log reference 
            msg.log = bot.log;
            
                      
            //avoid selftrigger for bot
            if (msg.from != bot.client.me) {
                if(msg.private) {
                    msg.command = msg.message;
                } else {
                    bot.trigger.concat([bot.client.me+":"]).forEach((prefix) => {
                        if (msg.message.startsWith(prefix)) {
                            
                            msg.command = msg.message.slice(prefix.length);
                        }    
                    
                    });
                    bot.trigger.concat([bot.client.me+":"]).forEach((prefix) => {
                        if (msg.message.startsWith(prefix)) {
                            
                            msg.command = msg.message.slice(prefix.length);
                        }    
                    
                    });
                }
                
                if(msg.command) {
                    if (!msg.private && bot.unrestricted) {
                        irc.emit('command', msg);
                    } else {
                        if (msg.authorized) {
                            irc.emit('command', msg);
                        } else if(msg.command.startsWith('login')) {
                            var split = msg.command.split(' ');
                            if(split.length > 1) {
                                 msg.command = 'su("' +  split[1] + '")';
                                 irc.emit('command', msg);
                            }

                        } else {
                            irc.send(msg.to, msg.from + ": access denied. If you like to contribute in the development process, please contact earendel.");
                        }
                    }    
                }
              }
            })
                
         }
};
 
function logger(bot) {
    return function (irc) {
        irc.on('welcome', function (msg) {
            //if(bot.logging)
                console.log(msg.message + "\r\n");
        });   
        irc.on('notice', function (msg) {
            //if(bot.logging)
                console.log(msg.message + "\r\n");
        });    
        irc.on('message', function (msg) {
            if((bot.logging) || (msg.to == bot.client.me) || (msg.to == '##ge') || (msg.message.startsWith(bot.client.me))) 
                console.log(msg.message + "\r\n");
        });    
        //irc.stream.pipe(stream);
    }
}



module.exports = Bot;