#Grapevine

##Example
**server.js**
```node
var express = require('express');
var Grapevine = require('grapevine-server');
var app = express();
var server = app.listen(3000);

app.use('/peer-endpoint', Grapevine.setup(server, {}));
app.get('/sendMessage', function(req, res){
  Grapevine.messagePeers('hello world');
  return res.sendStatus(200);
});
```
**index.html**
```html
<script src="grapevine-client.js"></script>
<script>
  var GV = new Grapevine();
  var options = {
    host: 'localhost',
    port: 3000,
    peerEndpoint: '/webrtc',
    childrenEndpoint: '/children'
  };
  GV.connect(options);
  GV.onMessage(function(message){
    console.log('received message through Grapevine', message);
  });
</script>
```
