# deepblu 
### IRC ECMA REPL BOT
(Early Alpha Playground)
```
#installation
git clone git@github.com:hagb4rd/deepblu.git
npm install

#setup environment variables & start via
node repl.js
```
####ENVIRONMENT VARIABLES
SET (windows) / EXPORT (unix)
```
SET DEEPBLU_IRC_AUTHORIZE=~account@hostmask
SET DEEPBLU_IRC_CHANNEL=#channel1,#channel2
SET DEEPBLU_IRC_HOST=irc.freenode.net
SET DEEPBLU_IRC_NICK=myservicebot
SET DEEPBLU_IRC_PASS=
SET DEEPBLU_IRC_PORT=6667
SET DEEPBLU_IRC_PFX_FILEPATH=ssl-cert.pfx
SET DEEPBLU_IRC_PFX_PASS=
SET DEEPBLU_IRC_TRIGGER=-->
SET DEEPBLU_IRC_UNRESTRICTED=false
SET DEEPBLU_IRC_USER=myservicebot
```
######DEEPBLU_IRC_AUTHORIZE 
Specified account has unrestricted access.

######DEEPBLU_IRC_UNRESTRICTED
If `true` every user can trigger the bots command functions.

######DEEPBLU_IRC_TRIGGER
A Message prefixed with that string triggers the `command` event.

######DEEPBLU_IRC_PFX_FILEPATH
A file holding the PFX or PKCS12 encoded private key, certificate, and CA certificates.
Help on generating [OpenSSL](https://nodejs.org/api/tls.html#tls_tls_ssl) keys, and signing certificates.

######DEEPBLU_IRC_PFX_PASS
Passphrase for PFX file.

######DEEPBLU_IRC_CHANNEL
Channel list to join on connect (separate by coma, no whitespace)

######DEEPBLU_IRC_USER
######DEEPBLU_IRC_HOST
######DEEPBLU_IRC_NICK
######DEEPBLU_IRC_PASS
IRC Client Parameters for the Bot.
