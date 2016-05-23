//require modules
require('es5-shim');
require('es6-shim');
require('es7-shim');
//require("babel-polyfill");
var babel = require("babel-core");


var net = require('net');
var util = require('util');
var vm = require('vm');
var extend = require('extend');
var lib = require('./lib/functions');
var google = require('./lib/google');
//repl context module
var REPLContext = require('./context');


// REPL Options
// ============
var connections = 0;
var PORT = 9898;
var TIMEOUT = 12;

// START REPL
// ==========
var repl, terminal, replServer;

replServer = net.createServer(function(socket) {
    repl = require('repl').start({
    prompt: "> ", //the prompt and stream for all I/O. Defaults to > .
    input: socket, // - the readable stream to listen to. Defaults to process.stdin.
    output: socket, //- the writable stream to write readline data to. Defaults to process.stdout.
    terminal: true, // - pass true if the stream should be treated like a TTY, and have ANSI/VT100 escape codes written to it. Defaults to checking isTTY on the output stream upon instantiation.
    //eval: run, //- function that will be used to eval each given line. Defaults to an async wrapper for eval(). See below for an example of a custom eval.
    useColors: false, // - a boolean which specifies whether or not the writer function should output colors. If a different writer function is set then this does nothing. Defaults to the repl's terminal value.
    useGlobal: false, // - if set to true, then the repl will use the global object, instead of running scripts in a separate context. Defaults to false.
    ignoreUndefined: true // - if set to true, then the repl will not output the return value of command if it's undefined. Defaults to false.
    // - the function to invoke for each command that gets evaluated which returns the formatting (including coloring) to display. Defaults to util.inspect.
    //*
    
        /* */
        //replMode: magic
    });
    repl.context = new REPLContext(repl);
    repl.writer = function(toInspect) { 
        var showHidden = repl.context.util.inspect.config.showHidden || false;
        var depth = repl.context.util.inspect.config.depth || 0;
        var colors = repl.context.util.inspect.config.colors || true;
        var result = toInspect;
        if(typeof(result) !== 'string') {
            result = util.inspect(toInspect, {
                showHidden: showHidden,
                depth: depth,
                colors: colors
            });   
        }
        if((result instanceof Promise) !== true) 
        {
            return result;
        }
    }



    //.clear RESET context 
    repl.on('reset', (context) => {
        console.log('repl has a new context');
        //context = extend(new REPLContext(repl), context);
        //context.extend(new REPLContext(repl))
        context = new REPLContext(repl);
        return context;
        
    });

    //ready.
    repl.displayPrompt();
    
    
    // REPL DEFINE COMMANDS
    // =====================

    //googleQueryFunctor

    /**
     * (description)
     * 
     * @param queryAdd ()
     * @returns (description)
     */
    function googleQuery(queryAdd) {
        if(queryAdd)
            queryAdd = " " + queryAdd;
        else 
            queryAdd = "";
            
        return function(query) {
            repl.context.lucky(query + queryAdd).then(x => {

                //console.log(x);
                repl.write(x + "\r\n");
                repl.displayPrompt();
            });
        }
    }

    repl.defineCommand('g', {
        help: 'repl.context.lucky Google Search',
        action: googleQuery()
    });

    repl.defineCommand('gif', {
        help: 'gif image search -> ',
        action: function(query) {
            google.gif.search(query).then(function(result) {
                repl.context.stack = repl.context.stack || []; 
                repl.context.stack.push(result);
                var shortResult = result.items.map(item=>'< ' + item.link.toString() + ' > ' + item.title.toString());
                var is = result.items.map(item=>item.link);
                repl.context.images = repl.context.images || [];
                repl.context.images = repl.context.images.concat(is);
                console.log(shortResult.join(' | ') + ' --> images.random() //try\r\n');
                repl.displayPrompt();          
            })
            
        }
    })

    repl.defineCommand('mdn', {
        help: 'Search Mozilla Development Network',
        action: googleQuery("javascript site:developer.mozilla.org")
    });
    repl.defineCommand('yt', {
        help: 'youtube search',
        action: function(query) {
            repl.context.googlesearch(query + " site:youtube.com").then(list => {
                repl.context.stack.push(list);
                var i = 0;
                while (i++ < 3)
                    format.youtube(list[i]);
                repl.displayPrompt();
            });
        }
    });
    repl.defineCommand('learn', {
        help: 'learn <command> { help: "helptext", action: function(query) { repl.displayPrompt(); } }',
        action: function(query) {

            var split = query.split(' ');
            var command = split.shift();
            var commandObject = eval(split.join(' '));
            if (commandObject.help && commandObject.action) {
                try {
                    repl.defineCommand(command, {
                        help: commandObject.help,
                        action: function(q) {
                            commandObject.action(q);
                            repl.displayPrompt();
                        }
                    });
                    console.log('NEW COMMAND:\n\n' + commandObject.help);
                } catch (e) {
                    console.log('ERROR: learn command failed. USAGE:\n' + this.help);
                }

            }
        }
    });

    //FORMAT console
    //---------------
    var format = {};
    format.youtube = function(item, log) {
        log = log || console.log;
        log("\n");
        log(item.url + "\n");
        log("================================================================\n")
        log(item.title + "\n")
        log("================================================================\n")
        log(item.content + "\n\n");
    };
        
    
}).listen(PORT);


//
//------------------------------------------------------------------------------------
//

//CREATE REPL SERVER 
//===================
/*
var terminal, replServer;
replServer = net.createServer(function(socket) {
    terminal = require('repl').start({
        prompt: '> ',
        terminal: true,
        output: socket,
        useGlobal: false,
        input: socket,
        //*
        eval: function(cmd, context, file, callback) {
            callback = callback || function(err, res) {
                if (err) console.log(err);
                console.log(res);
            };

            var script = new vm.Script(cmd, {
                filename: 'context.vm'
            });
            var result = script.runInContext(repl.context, {
                timeout: TIMEOUT * 1000
            });
            callback(result);

        }
      

    });
    terminal.on('exit', function() {
        socket.end()
    });
    terminal.context = repl.context;
    
}).listen(PORT);

/* */



var argv = require('minimist')(process.argv);

var port = argv.port || (9898)
var host = argv.host || "127.0.0.1"



var sock = net.connect(port, host);


process.stdin.pipe(sock)
sock.pipe(process.stdout)
sock.on('connect', function () {
    process.stdin.resume();
    process.stdin.setRawMode(true)
})
sock.on('close', function done() {
    process.stdin.setRawMode(false)
    process.stdin.pause()
    sock.removeListener('close', done)
})
process.stdin.on('end', function () {
    sock.destroy()
    console.log()
})
process.stdin.on('data', function (b) {
    if (b.length === 1 && b[0] === 4) {
        process.stdin.emit('end')
    }
})


module.exports = repl;

//Catch uncaught errors
process.on('uncaught', function(e) {
    console.log(util.inspect(e,{showHidden: true, depth:null, color: true}));;
});
