# Grapevine
Transmit live socket updates through a distributed client P2P network, instead of requiring the server to do all of the heavy lifting. Uses WebRTC and `jsrsasign` encryption.

<img width="150" alt="grapevine" src="https://cloud.githubusercontent.com/assets/2483420/8975457/a26cf492-3633-11e5-9c6f-25c3501ad4af.png">

## Install
`npm install grapevine-server`

## Example Use
**server.js**
```javascript
var express = require('express');
var app = express();
var server = app.listen(3000);

var Grapevine = require('grapevine-server');
Grapevine.setup('/webrtc', app, server);

app.get('/sendMessage', function(req, res){
  Grapevine.messageAll('hello world');
  return res.sendStatus(200);
});
```
**index.html**
```html
<script src="https://cdn.rawgit.com/mLuby/grapevine/master/client/grapevine-client.js"></script>
<script>
  Grapevine.connectToServer({ host:'localhost', port:3000, path:'/webrtc' });
  Grapevine.onMessage = function(message){
    document.getElementById('title').innerHTML = 'I heard '+JSON.stringify(message)+' through the Grapevine';
  };
</script>
```
