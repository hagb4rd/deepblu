@echo off
REM cd /d D:\node.js\repl && C:\nodejs\node --debug-brk=5680 D:\node.js\repl\repl.js

REM title deepblu repl
setlocal
set workingdir=D:\node.js\deepblu
set noderun=C:\nodejs\node.exe
set replserver=D:\node.js\deepblu\repl.js
set replclient=D:\node.js\deepblu\repl-client.js
cd /d %workingdir% && start "deepblu REPL" %noderun% %replserver%
rem cd /d %workingdir% && start /min "replclient" %noderun% %replclient%
REM %noderun% %replclient%
endlocal