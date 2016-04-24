var es5 = require('es5-shim');
var es6 = require('es6-shim');
var es7 = require('es7-shim');
var Promise = require('bluebird');
var promisify = require('./lib/promisify');
var irc = require('slate-irc');
var net = require('net');
var extend = require('extend');

var config = {
    host: process.env['DEEPBLU_IRC_HOST'] || "irc.freenode.net", 
    port: process.env['DEEPBLU_IRC_PORT'] || 6667,
    nick: process.env['DEEPBLU_IRC_NICK'] || "deepblu",
    user: process.env['DEEPBLU_IRC_USER'] || "",
    authorize: [(process.env['DEEPBLU_IRC_AUTHORIZE'] || "")],
    trigger: [(process.env['DEEPBLU_IRC_TRIGGER'] || "-->"), this.nick+":"],
    channel: (process.env['DEEPBLU_IRC_CHANNEL']).split(','),
    unrestricted: (process.env['DEEPBLU_IRC_UNRESTRICTED'] === "true") || true
    // DEEPBLU_IRC_PASS
}

//Here's a slightly more complex example of a PONG plugin responding to PING messages:
function pong() {
    return function(irc){
        irc.on('data', function(msg){
            if ('PING' != msg.command) return;
            irc.write('PONG :' + msg.trailing);
            });
        };
};
function replcmd(bot) {
    return function (irc) {
        irc.on('message', function(msg) {
            if(msg.from != bot.nick) {
                bot.trigger.forEach((prefix)=> {
                    if(msg.message.startsWith(prefix)) {
                        //authorized?
                        if(bot.authorize.every((authorized)=>(authorized != (msg.hostmask.username+"@"+msg.hostmask.hostname)))) {
                            if(bot.unrestricted) {
                                msg.command = msg.message.slice(prefix.length);
                                irc.emit('command', msg);    
                            } else {
                                irc.send(msg.to, msg.from +": access denied.");    
                            }
                                                
                        } else {
                            msg.command = msg.message.slice(prefix.length);
                            irc.emit('command', msg);
                        }
                        
                        return;
                    }
                })
            }
        });
    }    
};
function logger(stream) {
    return function(irc){
        irc.stream.pipe(stream);
    }
}

function Bot(nick, user, pass, host, port) {
    var self = this;
    if(nick)
        self.nick = nick;
    if(user)
        self.user = user;
    if(host)
        self.host = host;
    if(port)
        self.port = port;
    self.stream = net.connect({port: self.port, host: self.host});
    self.client = promisify(irc(self.stream));    
    self.client.pass(pass);
    self.client.nick(self.nick);
    self.client.user(self.user, self.user);
    
    //install plugins
    self.client.use(pong());
    self.client.use(replcmd(self));
    self.client.use(logger(process.stdout));
}
Bot.prototype=config;

Bot.create = function(nick,user,pass,host,port) {
    nick = nick || config.nick;
    user = user || config.user;
    pass = pass || process.env['DEEPBLU_IRC_PASS'];
    host = host || config.host;
    port = port || config.port;
    return new Bot(nick, user, pass, host, port);
} 

module.exports = Bot;

//Catch uncaught errors
process.on('uncaught', function(e) {
    console.log(util.inspect(e, {showHidden: true, depth: null, colors: true}));
});

//------END--------
//config.channel.forEach((chan)=>client.join(chan));
//client.namesAsync('##ge').then((names) => console.log(names));
/*
Events
------
    data (msg) parsed IRC message
    message (event) on PRIVMSG
    notice (event) on NOTICE
    invite (event) on INVITE
    names (event) on RPL_NAMREPLY
    topic (event) on TOPIC
    away (event) on RPL_AWAY
    quit (event) on QUIT
    join (event) on JOIN
    part (event) on PART
    kick (event) on KICK
    mode (event) on MODE
    motd (event) on RPL_ENDOFMOTD
    nick (event) on NICK
    welcome (nick) on RPL_WELCOME
    whois (event) on RPL_ENDOFWHOIS
    errors (event) on ERR*_
    pong (event) on PONG
/* */