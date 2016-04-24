//-------------------------------------------
// jslave.js
//-------------------------------------------
// IRC-Bot
// Author: http://github.com/hagb4rd
//===========================================

//-------------------------------------------------------
// http://pastebin.com/embed_iframe.php?i=gsYF2hRR
//===========================================-
process.on('uncaughtException', function (err) {
    console.log('Uncaught exception: ' + err.stack);
});


var argv = require('minimist')(process.argv);



var es5shim = require('es5-shim');
var es6shim = require('es6-shim');
var es7shim = require('es7-shim');

var net = require('net');

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
