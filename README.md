#Grapevine

##Example
**server.js**
```node
var express = require('express');
var app = express();
var server = app.listen(3000);

var Grapevine = require('./grapevine-server');
Grapevine.setup('/webrtc', app, server);

app.get('/sendMessage', function(req, res){
  Grapevine.messageAll('hello world');
  return res.sendStatus(200);
});
```
**index.html**
```html
<script src="grapevine-client.js"></script>
<script>
  Grapevine.connectToServer({ host:'localhost', port:3000, path:'/webrtc' });
  Grapevine.onMessage = function(message){
    document.getElementById('title').innerHTML = 'I heard '+JSON.stringify(message)+' through the Grapevine';
  };
</script>
```
