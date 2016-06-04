//SLATE-IRC plugin
exports.evalJS = function(context, transpile) {
    return function (irc) {
        irc.on('command', function(msg) {

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
        })
    }
}